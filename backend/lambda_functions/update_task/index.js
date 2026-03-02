const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);
const sns = new SNSClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.TASKS_TABLE;
const TASK_NOTIFY_TOPIC_ARN = process.env.TASK_NOTIFY_TOPIC_ARN;
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()).filter(Boolean) : [];

const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];

exports.handler = async (event) => {
  try {
    const claims = event?.requestContext?.authorizer?.jwt?.claims;
    if (!claims) {
      return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const taskId = event?.pathParameters?.taskId;
    if (!taskId || !body.status) {
      return { statusCode: 400, body: JSON.stringify({ message: "taskId (path) and status (body) are required" }) };
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

    const task = result.Attributes || {};
    if (TASK_NOTIFY_TOPIC_ARN && ADMIN_EMAILS.length > 0) {
      try {
        await sns.send(new PublishCommand({
          TopicArn: TASK_NOTIFY_TOPIC_ARN,
          Message: JSON.stringify({
            type: "task_status_updated",
            adminEmails: ADMIN_EMAILS,
            taskTitle: task.title || "Task",
            taskId,
            newStatus: body.status
          })
        }));
      } catch (notifyErr) {
        console.warn("Failed to send status-updated notification:", notifyErr);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${error.message}` })
    };
  }
};
