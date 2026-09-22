import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'eu-north-1', // Hardcoded because Vercel automatically overrides AWS_REGION with its own lambda region
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export const docClient = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = "eduScribe_Data";

