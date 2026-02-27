/**
 * AWS Amplify configuration.
 * Auth uses Cognito (User Pool); env vars can come from .env / Amplify Console.
 */
import { Amplify } from "aws-amplify";

const region = import.meta.env.VITE_REGION || "eu-central-1";
const userPoolId = import.meta.env.VITE_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_APP_CLIENT_ID;

if (userPoolId && userPoolClientId) {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
        },
      },
    },
    { ssr: true }
  );
}

export const isCognitoConfigured = !!(userPoolId && userPoolClientId);
export { region, userPoolId, userPoolClientId };
