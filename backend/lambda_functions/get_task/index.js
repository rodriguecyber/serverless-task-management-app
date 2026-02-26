const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  try {
    const claims = event?.requestContext?.authorizer?.jwt?.claims;
    if (!claims) {
      return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
    }

    const taskId = event?.pathParameters?.taskId;
    if (!taskId) {
      return { statusCode: 400, body: JSON.stringify({ message: "taskId is required" }) };
    }

    const result = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TASK#${taskId}`,
        SK: "METADATA"
      }
    }));

    if (!result.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: "Task not found" }) };
    }

    const task = result.Item;
    const isAdmin = claims["cognito:groups"]?.includes("task_admin_group");
    if (!isAdmin) {
      const assignee = task.assignedTo;
      const assignedToUser = Array.isArray(assignee) ? assignee[0] : assignee;
      if (task.createdBy !== claims.sub && assignedToUser !== claims.sub) {
        return { statusCode: 403, body: JSON.stringify({ message: "Forbidden" }) };
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(task)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" })
    };
  }
};
