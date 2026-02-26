
//  admin only - creates a new task with PENDING status and no assignees
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");

const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  if (!event.requestContext?.authorizer?.jwt?.claims) {
    console.warn("Unauthorized: missing or invalid authorizer context", {
      hasRequestContext: !!event.requestContext,
      hasAuthorizer: !!event.requestContext?.authorizer,
      authorizerKeys: event.requestContext?.authorizer ? Object.keys(event.requestContext.authorizer) : [],
    });
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" })
    };
  }
  const user = event.requestContext.authorizer.jwt.claims;

  if (!user["cognito:groups"]?.includes("task_admin_group")) {
    return { statusCode: 403, body: JSON.stringify({ message: "Forbidden" }) };
  }

  const { title, description } = JSON.parse(event.body || "{}");
  if (!title || !description) {
    return { statusCode: 400, body: JSON.stringify({ message: "Title and description required" }) };
  }

  const taskId = uuidv4();
  const timestamp = new Date().toISOString();

  const item = {
    PK: { S: `TASK#${taskId}` },
    SK: { S: "METADATA" },
    title: { S: title },
    description: { S: description },
    status: { S: "PENDING" },
    createdBy: { S: user.sub },
    createdAt: { S: timestamp },
    updatedAt: { S: timestamp },
  };

  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: "attribute_not_exists(PK)"
  };

  try {
    await ddb.send(new PutItemCommand(params));
    return { statusCode: 201, body: JSON.stringify({ taskId, title, description }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: `Failed to create task: ${err.message}` };
  }
};