import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { db, TABLE_NAME } from '../utils/db';
import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, isPublic, password } = req.body;
    const user = req.user;
    if (!user || user.role !== 'staff') {
      res.status(403).json({ message: 'Only staff can create rooms' });
      return;
    }

    const roomCode = generateRoomCode();
    const now = new Date().toISOString();

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
        password: isPublic ? null : password,
        createdAt: now,
        studentsCount: 0,
        lecturesCount: 0
      }
    }));

    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${user.id}`,
        SK: `ROOM#${roomCode}`,
        roomCode,
        name,
        instructorName: user.name,
        role: 'owner',
        joinedAt: now
      }
    }));

    res.status(201).json({ roomCode, name, isPublic });
  } catch (error: any) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'AWS DB Error: ' + error.message });
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
    res.status(500).json({ message: 'AWS DB Error: ' + error.message });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomCode, password } = req.body;
    const user = req.user;
    if (!user) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const roomMeta = await db.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ROOM#${roomCode}`, SK: 'METADATA' }
    }));

    if (!roomMeta.Item) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    if (!roomMeta.Item.isPublic && roomMeta.Item.password !== password) {
      res.status(401).json({ message: 'Incorrect password for this private room' });
      return;
    }

    const now = new Date().toISOString();

    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${user.id}`,
        SK: `ROOM#${roomCode}`,
        roomCode,
        name: roomMeta.Item.name,
        instructorName: roomMeta.Item.instructorName,
        role: 'student',
        joinedAt: now
      }
    }));

    res.status(200).json({ message: 'Joined successfully', room: roomMeta.Item });
  } catch (error: any) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'AWS DB Error: ' + error.message });
  }
};
