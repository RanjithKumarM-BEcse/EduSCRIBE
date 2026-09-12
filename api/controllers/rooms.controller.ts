import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { mockDB } from '../utils/db';

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, isPublic, password } = req.body;
    const user = req.user;
    if (!user) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const roomCode = generateRoomCode();
    const now = new Date().toISOString();

    const newRoom = {
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

    // Save to Mock DB
    mockDB.rooms.set(roomCode, newRoom);

    // Save relation to user
    if (!mockDB.userRooms.has(user.id)) {
      mockDB.userRooms.set(user.id, new Set());
    }
    mockDB.userRooms.get(user.id)!.add(roomCode);

    res.status(201).json({ roomCode, name, isPublic });
  } catch (error: any) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Cloud DB Error: ' + error.message });
  }
};

export const getMyRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const myRoomCodes = mockDB.userRooms.get(user.id) || new Set();
    const myRooms = Array.from(myRoomCodes)
      .map(code => mockDB.rooms.get(code))
      .filter(Boolean);

    res.status(200).json({ rooms: myRooms });
  } catch (error: any) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Cloud DB Error: ' + error.message });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomCode, password } = req.body;
    const user = req.user;
    if (!user) { res.status(401).json({ message: 'Unauthorized' }); return; }

    const roomMeta = mockDB.rooms.get(roomCode);

    if (!roomMeta) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    if (!roomMeta.isPublic && roomMeta.password !== password) {
      res.status(401).json({ message: 'Incorrect password for this private room' });
      return;
    }

    // Add to user's joined rooms
    if (!mockDB.userRooms.has(user.id)) {
      mockDB.userRooms.set(user.id, new Set());
    }
    mockDB.userRooms.get(user.id)!.add(roomCode);
    
    // Increment student count
    roomMeta.studentsCount = (roomMeta.studentsCount || 0) + 1;

    res.status(200).json({ message: 'Joined successfully', room: roomMeta });
  } catch (error: any) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Cloud DB Error: ' + error.message });
  }
};
