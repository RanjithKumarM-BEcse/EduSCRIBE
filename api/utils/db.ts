import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let cachedClient: DynamoDBDocumentClient | null = null;

export const getDocClient = () => {
  if (cachedClient) return cachedClient;
  
  const client = new DynamoDBClient({
    region: 'eu-north-1',
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || ''
    }
  });
  
  cachedClient = DynamoDBDocumentClient.from(client);
  return cachedClient;
};

export const TABLE_NAME = "eduScribe_Data";

