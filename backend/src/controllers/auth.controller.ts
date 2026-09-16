import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { User } from '../types/firestore';

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { email, name } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user profile in Firestore
      const newUser: Omit<User, 'id'> = {
        name: name || email?.split('@')[0] || 'User',
        email: email || '',
        skills: [],
        interests: [],
        roles: [],
        hackathons: [],
        projects: [],
        createdAt: new Date(),
      };
      
      await userRef.set(newUser);
      res.status(201).json({ message: 'User created in Firestore', user: { id: userId, ...newUser } });
    } else {
      // User already exists
      res.status(200).json({ message: 'User synced', user: { id: userId, ...userDoc.data() } });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      res.status(404).json({ message: 'User not found in Firestore' });
      return;
    }
    
    res.json({ user: { id: userId, ...userDoc.data() } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
