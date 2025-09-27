import { Amplify } from 'aws-amplify';

// AWS Cognito configuration for Amplify v6
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || 'us-east-1_Wfn3se9zs',
      userPoolClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID || 'nddpfict254fb50jorufj8g78',
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || 'us-east-1:be070502-f375-4582-b4a8-8d1dbda35706',
      loginWith: {
        email: true,
        username: false,
        phone: false
      }
    }
  },
  API: {
    REST: {
      WorldSenseAPI: {
        endpoint: import.meta.env.VITE_API_BASE || 'https://8p15o14kp9.execute-api.us-east-1.amazonaws.com',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      },
    },
  },
};

// Configure Amplify
Amplify.configure(awsConfig);

export default awsConfig;