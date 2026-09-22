import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'eu-north-1' // Hardcoded because Vercel automatically overrides AWS_REGION with its own lambda region
});

export const docClient = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = "eduScribe_Data";

