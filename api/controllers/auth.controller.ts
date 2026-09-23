import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  // Keeping this for later
  res.status(501).json({ message: 'Not implemented' });
};

export const testLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const randomId = Math.floor(Math.random() * 10000);
    const userId = `demo_user_${randomId}`;
    const email = `demo${randomId}@eduscribe.com`;
    const name = "Demo User";
    const avatar = "https://ui-avatars.com/api/?name=Demo+User&background=6C47FF&color=fff";

    // Randomly assign role if it doesn't exist, but we prompt them in UI anyway
    const userRole = null; 
    
    // User storage in DynamoDB would go here (omitted for test login)

    const jwtToken = jwt.sign(
      { id: userId, email, role: userRole, name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token: jwtToken,
      user: { id: userId, email, name, avatar, role: userRole },
      isNewUser: true
    });
  } catch (error: any) {
    console.error('Test login error:', error);
    res.status(500).json({ message: 'Cloud DB Error: ' + error.toString() });
  }
};
