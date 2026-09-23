import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { getDocClient, TABLE_NAME } from '../utils/db';
import { PutCommand, QueryCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, isPublic, password } = req.body;
    const user = req.user;
    if (!user) { res.status(403).json({ message: 'Unauthorized' }); return; }

    const roomCode = generateRoomCode();
    const now = new Date().toISOString();

    const newRoom = {
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
    };

    const docClient = getDocClient();

    // Save Room
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newRoom
    }));

    // Save User-Room Relation
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${user.id}`,
        SK: `ROOM#${roomCode}`,
        joinedAt: now
      }
    }));

    res.status(201).json({ roomCode, name, isPublic });
  } catch (error: any) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'DynamoDB Error: ' + error.message });
  }
};

export const getMyRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const docClient = getDocClient();

    const relations = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${user.id}`,
        ':sk': 'ROOM#'
      }
    }));

    if (!relations.Items || relations.Items.length === 0) {
      res.status(200).json({ rooms: [] });
      return;
    }

    const roomCodes = relations.Items.map(item => item.SK.split('#')[1]);
    
    // Fetch all room metadata
    const roomPromises = roomCodes.map(code => 
      docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ROOM#${code}`, SK: 'METADATA' }
      }))
    );
    
    const roomsData = await Promise.all(roomPromises);
    const validRooms = roomsData.map(r => r.Item).filter(Boolean);

    res.status(200).json({ rooms: validRooms });
  } catch (error: any) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'DynamoDB Error: ' + error.message });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomCode, password } = req.body;
    const user = req.user;
    if (!user) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const docClient = getDocClient();

    const roomRes = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ROOM#${roomCode}`, SK: 'METADATA' }
    }));

    const roomMeta = roomRes.Item;

    if (!roomMeta) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    if (!roomMeta.isPublic && roomMeta.password !== password) {
      res.status(401).json({ message: 'Incorrect password for this private room' });
      return;
    }

    // Add to user's joined rooms
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${user.id}`,
        SK: `ROOM#${roomCode}`,
        joinedAt: new Date().toISOString()
      }
    }));
    
    // Increment student count
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ROOM#${roomCode}`, SK: 'METADATA' },
      UpdateExpression: 'SET studentsCount = if_not_exists(studentsCount, :start) + :inc',
      ExpressionAttributeValues: {
        ':start': 0,
        ':inc': 1
      }
    }));

    res.status(200).json({ message: 'Joined successfully', room: roomMeta });
  } catch (error: any) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'DynamoDB Error: ' + error.message });
  }
};

export const getRoomData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomCode } = req.params;
    const docClient = getDocClient();

    const response = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomCode}`
      }
    }));

    if (!response.Items || response.Items.length === 0) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    let roomMeta = null;
    const lectures: any[] = [];

    response.Items.forEach(item => {
      if (item.SK === 'METADATA') roomMeta = item;
      else if (item.SK.startsWith('LECTURE#')) lectures.push(item);
    });

    res.status(200).json({ room: roomMeta, lectures });
  } catch (error: any) {
    res.status(500).json({ message: 'DynamoDB Error: ' + error.message });
  }
};

export const addLecture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomCode } = req.params;
    const lectureData = req.body;
    const docClient = getDocClient();

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ROOM#${roomCode}`,
        SK: `LECTURE#${lectureData.id}`,
        ...lectureData
      }
    }));

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ROOM#${roomCode}`, SK: 'METADATA' },
      UpdateExpression: 'SET lecturesCount = if_not_exists(lecturesCount, :start) + :inc',
      ExpressionAttributeValues: { ':start': 0, ':inc': 1 }
    }));

    res.status(201).json({ message: 'Lecture added successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'DynamoDB Error: ' + error.message });
  }
};

export const removeLecture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomCode, lectureId } = req.params;
    const docClient = getDocClient();
    
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ROOM#${roomCode}`, SK: `LECTURE#${lectureId}` }
    }));

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ROOM#${roomCode}`, SK: 'METADATA' },
      UpdateExpression: 'SET lecturesCount = lecturesCount - :dec',
      ExpressionAttributeValues: { ':dec': 1 }
    }));

    res.status(200).json({ message: 'Lecture removed' });
  } catch (error: any) {
    res.status(500).json({ message: 'DynamoDB Error: ' + error.message });
  }
};
