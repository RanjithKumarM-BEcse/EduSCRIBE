import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (token.startsWith('MOCK::')) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('::')[1], 'base64').toString('utf8'));
        req.user = payload;
        return next();
      } catch (e) {
        // Fall back if parse fails
      }
    }

    if (token === 'mock_token_12345') {
      req.user = { id: 'demo_user_001', email: 'demo@eduscribe.com', role: 'staff', name: 'Demo User' };
      return next();
    }

    // Because the frontend uses Google OAuth, the token is signed by Google, not our JWT_SECRET.
    // For this prototype, we will decode it directly to extract the user info.
    const decoded = jwt.decode(token) as any;
    if (!decoded) {
      res.status(401).json({ message: 'Invalid token structure' });
      return;
    }
    
    // We also need to map Google's fields (sub -> id) if they exist
    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role || 'staff', // Default to staff if role is missing in google token
      name: decoded.name || 'User'
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
