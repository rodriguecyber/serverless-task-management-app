const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  try {
    const claims = event?.requestContext?.authorizer?.jwt?.claims;
    if (!claims) {
      return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
    }

    const userId = claims.sub;
    const result = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :gsi1pk",
      ExpressionAttributeValues: {
        ":gsi1pk": `USER#${userId}`
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items || [])
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error: " + error.message })
    };
  }
};
