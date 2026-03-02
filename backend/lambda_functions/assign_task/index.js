const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { CognitoIdentityProviderClient, AdminGetUserCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);
const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const sns = new SNSClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.TASKS_TABLE;
const USER_POOL_ID = process.env.USER_POOL_ID;
const TASK_NOTIFY_TOPIC_ARN = process.env.TASK_NOTIFY_TOPIC_ARN;

exports.handler = async (event) => {
  try {
    const claims = event?.requestContext?.authorizer?.jwt?.claims;
    if (!claims) {
      return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
    }

    if (!claims["cognito:groups"]?.includes("Admin")) {
      return { statusCode: 403, body: JSON.stringify({ message: "Forbidden" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const taskId = event?.pathParameters?.taskId;
    const assignedTo = body.assignedTo;
    if (!taskId || !assignedTo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "taskId (path) and assignedTo (body) required" })
      };
    }

    const result = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TASK#${taskId}`,
        SK: "METADATA"
      },
      UpdateExpression: "SET assignedTo = :assignedTo, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":assignedTo": assignedTo,
        ":gsi1pk": `USER#${assignedTo}`,
        ":gsi1sk": `TASK#${taskId}`,
        ":updatedAt": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    }));

    const task = result.Attributes || {};
    const taskTitle = task.title || "Task";

    if (TASK_NOTIFY_TOPIC_ARN && USER_POOL_ID) {
      try {
        const cognitoUser = await cognito.send(new AdminGetUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: assignedTo
        }));
        const emailAttr = cognitoUser.UserAttributes?.find((a) => a.Name === "email");
        const toEmail = emailAttr?.Value;
        if (toEmail) {
          await sns.send(new PublishCommand({
            TopicArn: TASK_NOTIFY_TOPIC_ARN,
            Message: JSON.stringify({ type: "task_assigned", toEmail, taskTitle, taskId })
          }));
        }
      } catch (notifyErr) {
        console.warn("Failed to send assign notification:", notifyErr);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Task assigned successfully",
        task: result.Attributes
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${error.message}` })
    };
  }
};
