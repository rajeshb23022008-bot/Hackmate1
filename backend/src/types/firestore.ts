export interface User {
  id: string; // Stored as document ID, but good to have in type
  name: string;
  email: string;
  college?: string;
  department?: string;
  year?: string;
  bio?: string;
  profileImage?: string;
  skills: { name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' }[];
  interests: string[];
  roles: string[];
  experience?: string;
  availability?: string;
  hackathons: string[]; // array of hackathon IDs
  projects: { title: string; link?: string; description?: string }[];
  github?: string;
  linkedin?: string;
  createdAt: Date | any; // Firebase Timestamp
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  hackathonId: string;
  problemStatement?: string;
  description?: string;
  members: string[]; // array of user IDs
  requiredSkills: string[];
  missingRoles: string[];
  maxMembers: number;
  status: 'Open' | 'Closed';
  createdAt: Date | any;
}

export interface Hackathon {
  id: string;
  name: string;
  description: string;
  registrationDeadline: Date | any;
  teamSize: { min: number; max: number };
  problemStatements: string[];
  status: 'Upcoming' | 'Active' | 'Completed';
}

export interface Request {
  id: string;
  senderId: string;
  receiverId: string;
  teamId?: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: Date | any;
}

export interface Message {
  id: string;
  teamId: string;
  senderId: string;
  message: string;
  timestamp: Date | any;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date | any;
}
