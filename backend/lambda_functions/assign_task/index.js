const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  try {
    const claims = event?.requestContext?.authorizer?.jwt?.claims;
    if (!claims) {
      return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
    }

    if (!claims["cognito:groups"]?.includes("task_admin_group")) {
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
