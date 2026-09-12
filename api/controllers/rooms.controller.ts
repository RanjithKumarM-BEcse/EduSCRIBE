import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { db, TABLE_NAME } from '../utils/db';
import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

// Helper to generate 6 char code
const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, isPublic } = req.body;
    const user = req.user;

    if (!user || user.role !== 'staff') {
      res.status(403).json({ message: 'Only staff can create rooms' });
      return;
    }

    const roomCode = generateRoomCode();
    const now = new Date().toISOString();

    // 1. Create Room Metadata
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ROOM#${roomCode}`,
        SK: 'METADATA',
        roomCode,
        name,
        instructorId: user.id,
        instructorName: user.name,
        isPublic: !!isPublic,
        createdAt: now
      }
    }));

    // 2. Add creator as a member (owner)
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ROOM#${roomCode}`,
        SK: `MEMBER#${user.id}`,
        userId: user.id,
        userName: user.name,
        role: 'owner',
        status: 'admitted',
        joinedAt: now
      }
    }));

    // 3. Add to user's list of rooms (for easy querying)
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${user.id}`,
        SK: `ROOM#${roomCode}`,
        roomCode,
        name,
        role: 'owner'
      }
    }));

    res.status(201).json({ roomCode, name, isPublic });
  } catch (error: any) {
    console.error('Create room error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getMyRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const result = await db.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${user.id}`,
        ':sk': 'ROOM#'
      }
    }));

    res.status(200).json({ rooms: result.Items || [] });
  } catch (error: any) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
