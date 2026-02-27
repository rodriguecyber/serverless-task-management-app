const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

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

    const taskId = event?.pathParameters?.taskId;
    if (!taskId) {
      return { statusCode: 400, body: JSON.stringify({ message: "taskId is required" }) };
    }

    await ddb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TASK#${taskId}`,
        SK: "METADATA"
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Task deleted" })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${error.message}` })
    };
  }
};
