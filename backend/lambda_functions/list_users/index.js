const { CognitoIdentityProviderClient, ListUsersCommand } = require("@aws-sdk/client-cognito-identity-provider");

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const USER_POOL_ID = process.env.USER_POOL_ID;

exports.handler = async (event) => {
  if (!event.requestContext?.authorizer?.jwt?.claims) {
    return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
  }
  const claims = event.requestContext.authorizer.jwt.claims;
  if (!claims["cognito:groups"]?.includes("task_admin_group")) {
    return { statusCode: 403, body: JSON.stringify({ message: "Forbidden" }) };
  }

  if (!USER_POOL_ID) {
    return { statusCode: 500, body: JSON.stringify({ message: "USER_POOL_ID not configured" }) };
  }

  try {
    const result = await cognito.send(new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: 60
    }));

    const users = (result.Users || []).map((u) => ({
      sub: u.Username,
      email: u.Attributes?.find((a) => a.Name === "email")?.Value,
      emailVerified: u.Attributes?.find((a) => a.Name === "email_verified")?.Value === "true",
      status: u.UserStatus,
      enabled: u.Enabled,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to list users" }),
    };
  }
};
