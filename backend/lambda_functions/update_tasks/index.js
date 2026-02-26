const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];

exports.handler = async (event) => {
  try {
    const claims = event?.requestContext?.authorizer?.jwt?.claims;
    if (!claims) {
      return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const taskId = event?.pathParameters?.taskId || body.taskId;
    if (!taskId || !body.status) {
      return { statusCode: 400, body: JSON.stringify({ message: "taskId and status are required" }) };
    }
    if (!validStatuses.includes(body.status)) {
      return { statusCode: 400, body: JSON.stringify({ message: "status must be PENDING, IN_PROGRESS, or COMPLETED" }) };
    }

    const isAdmin = claims["cognito:groups"]?.includes("task_admin_group");
    if (!isAdmin) {
      const getResult = await ddb.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `TASK#${taskId}`, SK: "METADATA" },
      }));
      const task = getResult.Item;
      if (!task) {
        return { statusCode: 404, body: JSON.stringify({ message: "Task not found" }) };
      }
      const assignee = task.assignedTo;
      const assignedToUser = Array.isArray(assignee) ? assignee[0] : assignee;
      if (assignedToUser !== claims.sub) {
        return { statusCode: 403, body: JSON.stringify({ message: "You can only update status of tasks assigned to you" }) };
      }
    }

    const result = await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TASK#${taskId}`,
        SK: "METADATA"
      },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": body.status,
        ":updatedAt": new Date().toISOString()
      },
      ReturnValues: "ALL_NEW"
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" })
    };
  }
};
