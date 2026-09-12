import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { db, TABLE_NAME } from '../utils/db';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Invalid token payload' });
      return;
    }

    const userId = payload.sub; // Google ID
    const email = payload.email;
    const name = payload.name || 'User';
    const avatar = payload.picture || '';

    // Check if user exists
    const getResult = await db.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      }
    }));

    let userRole = 'student'; // Default, but might prompt for selection later
    let isNewUser = false;

    if (!getResult.Item) {
      // Create new user profile
      isNewUser = true;
      await db.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
          id: userId,
          email,
          name,
          avatar,
          role: null // Require them to pick a role
        }
      }));
    } else {
      userRole = getResult.Item.role;
    }

    // Sign our own JWT
    const jwtToken = jwt.sign(
      { id: userId, email, role: userRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token: jwtToken,
      user: {
        id: userId,
        email,
        name,
        avatar,
        role: userRole
      },
      isNewUser
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const testLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = "test_user_123";
    const email = "test@eduscribe.com";
    const name = "Test User";
    const avatar = "https://ui-avatars.com/api/?name=Test+User&background=6C47FF&color=fff";

    const getResult = await db.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'PROFILE'
      }
    }));

    let userRole = 'staff'; 
    let isNewUser = false;

    if (!getResult.Item) {
      isNewUser = true;
      await db.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
          id: userId,
          email,
          name,
          avatar,
          role: null
        }
      }));
      userRole = 'student'; // Force role selection
    } else {
      userRole = getResult.Item.role;
    }

    const jwtToken = jwt.sign(
      { id: userId, email, role: userRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token: jwtToken,
      user: { id: userId, email, name, avatar, role: userRole },
      isNewUser
    });
  } catch (error: any) {
    console.error('Test login error:', error);
    res.status(500).json({ message: 'AWS DynamoDB Error: ' + error.toString() });
  }
};
