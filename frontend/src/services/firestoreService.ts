import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { UserProfile } from '../context/AuthContext';


// ==========================================
// 1. TEAM MODELS & OPERATIONS
// ==========================================
export interface TeamMember {
  uid: string;
  name: string;
  email?: string;
  role: string;
  isLeader?: boolean;
  joinedAt?: any;
}

export interface Team {
  id?: string;
  name: string;
  hackathon: string;
  problemStatement: string;
  description: string;
  requiredSkills: string[];
  maxSize: number;
  missingRoles: string[];
  college: string;
  deadline?: string;
  leaderId: string;
  leaderName: string;
  leaderEmail?: string;
  members: TeamMember[];
  createdAt?: any;
  updatedAt?: any;
}

const isTestMember = (name?: string, email?: string) => {
  const n = (name || '').toLowerCase();
  const e = (email || '').toLowerCase();
  return (
    n.includes('alpha leader') ||
    n.includes('beta applicant') ||
    n.includes('mahendra singh dhoni') ||
    n.includes('dhoni') ||
    e.includes('alpha') ||
    e.includes('beta')
  );
};

// Helper to clean duplicate & test members in team objects
const sanitizeTeam = (team: Team): Team => {
  if (!team.members || !Array.isArray(team.members)) {
    return { ...team, members: [] };
  }
  const seen = new Set<string>();
  const uniqueMembers: TeamMember[] = [];
  for (const m of team.members) {
    if (m && m.uid && !seen.has(m.uid) && !isTestMember(m.name, m.email)) {
      seen.add(m.uid);
      uniqueMembers.push(m);
    }
  }
  return { ...team, members: uniqueMembers };
};

export const createTeam = async (
  teamData: Omit<Team, 'id' | 'members' | 'createdAt' | 'updatedAt'>,
  leaderData: { uid: string; name: string; email?: string }
): Promise<string> => {
  const teamsRef = collection(db, 'teams');
  const leaderMember: TeamMember = {
    uid: leaderData.uid,
    name: leaderData.name,
    email: leaderData.email || '',
    role: 'Team Leader',
    isLeader: true,
    joinedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(teamsRef, {
    ...teamData,
    leaderId: leaderData.uid,
    leaderName: leaderData.name,
    leaderEmail: leaderData.email || '',
    members: [leaderMember],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const getAllTeams = async (): Promise<Team[]> => {
  try {
    const q = query(collection(db, 'teams'));
    const snapshot = await getDocs(q);
    const rawTeams = snapshot.docs.map((d) => sanitizeTeam({ id: d.id, ...d.data() } as Team));
    
    // Deduplicate by lowercased team name & filter out test seed teams
    const seenNames = new Set<string>();
    const uniqueTeams: Team[] = [];

    for (const t of rawTeams) {
      const nameKey = (t.name || '').trim().toLowerCase();
      if (
        !nameKey ||
        seenNames.has(nameKey) ||
        nameKey.includes('seed') ||
        nameKey.includes('cyberknights') ||
        nameKey.includes('neuralsquad')
      ) {
        continue;
      }
      seenNames.add(nameKey);
      uniqueTeams.push(t);
    }

    return uniqueTeams.sort((a, b) => {
      const tA = a.createdAt?.toMillis?.() || 0;
      const tB = b.createdAt?.toMillis?.() || 0;
      return tB - tA;
    });
  } catch (err) {
    console.warn('Error fetching teams:', err);
    return [];
  }
};

export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    const ref = doc(db, 'teams', teamId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return sanitizeTeam({ id: snap.id, ...snap.data() } as Team);
    }
    return null;
  } catch (err) {
    console.error('Error fetching team by id:', err);
    return null;
  }
};

export const subscribeUserTeams = (userId: string, callback: (teams: Team[]) => void) => {
  try {
    const q = query(collection(db, 'teams'));
    return onSnapshot(
      q,
      (snapshot) => {
        const all = snapshot.docs.map((d) => sanitizeTeam({ id: d.id, ...d.data() } as Team));
        const userTeams = all.filter(
          (t) => t.leaderId === userId || t.members?.some((m) => m.uid === userId)
        );
        userTeams.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || 0;
          const tB = b.createdAt?.toMillis?.() || 0;
          return tB - tA;
        });
        callback(userTeams);
      },
      (err) => {
        console.warn('Failed to subscribe user teams:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('Failed to attach user teams listener:', err);
    callback([]);
    return () => {};
  }
};

// ==========================================
// 2. REQUEST MODELS & OPERATIONS
// ==========================================
export interface TeamRequest {
  id?: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  receiverId: string;
  receiverName?: string;
  teamId: string;
  teamName: string;
  role?: string;
  message?: string;
  type: 'join_request' | 'invite';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
  updatedAt?: any;
}

export const sendTeamRequest = async (
  requestData: Omit<TeamRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const reqRef = collection(db, 'requests');
  const docRef = await addDoc(reqRef, {
    ...requestData,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const title =
    requestData.type === 'join_request'
      ? `New Application from ${requestData.senderName}`
      : `Team Invitation from ${requestData.senderName}`;
  const message =
    requestData.type === 'join_request'
      ? `${requestData.senderName} requested to join "${requestData.teamName}" as ${requestData.role || 'Member'}.`
      : `${requestData.senderName} invited you to join "${requestData.teamName}".`;

  await createNotification({
    userId: requestData.receiverId,
    senderId: requestData.senderId,
    senderName: requestData.senderName,
    type: 'request_received',
    title,
    message,
    link: '/app/my-team',
    read: false,
  });

  return docRef.id;
};

export const subscribeIncomingRequests = (
  userId: string,
  callback: (requests: TeamRequest[]) => void
) => {
  try {
    const q = query(collection(db, 'requests'), where('receiverId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TeamRequest));
        requests.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || 0;
          const tB = b.createdAt?.toMillis?.() || 0;
          return tB - tA;
        });
        callback(requests);
      },
      (err) => {
        console.warn('Failed to subscribe incoming requests:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('Error attaching incoming requests listener:', err);
    callback([]);
    return () => {};
  }
};

export const subscribeOutgoingRequests = (
  userId: string,
  callback: (requests: TeamRequest[]) => void
) => {
  try {
    const q = query(collection(db, 'requests'), where('senderId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TeamRequest));
        requests.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || 0;
          const tB = b.createdAt?.toMillis?.() || 0;
          return tB - tA;
        });
        callback(requests);
      },
      (err) => {
        console.warn('Failed to subscribe outgoing requests:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('Error attaching outgoing requests listener:', err);
    callback([]);
    return () => {};
  }
};

export const acceptTeamRequest = async (
  request: TeamRequest,
  memberToAdd: { uid: string; name: string; email?: string; role?: string }
) => {
  if (!request.id) return;

  // Fetch current team to check members and max size limit
  const teamRef = doc(db, 'teams', request.teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) {
    throw new Error('Team does not exist.');
  }

  const currentTeam = sanitizeTeam({ id: teamSnap.id, ...teamSnap.data() } as Team);
  const currentMembers = currentTeam.members || [];
  const maxSize = currentTeam.maxSize || 6;

  // Check if member already in team
  if (currentMembers.some((m) => m.uid === memberToAdd.uid)) {
    // Already in team, just mark request accepted
    const reqRef = doc(db, 'requests', request.id);
    await updateDoc(reqRef, { status: 'accepted', updatedAt: serverTimestamp() });
    return;
  }

  // Check max size
  if (currentMembers.length >= maxSize) {
    throw new Error(`Team is full! Maximum team size of ${maxSize} members reached.`);
  }

  // 1. Update request status
  const reqRef = doc(db, 'requests', request.id);
  await updateDoc(reqRef, {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });

  // 2. Add member to team in Firestore
  const newMember: TeamMember = {
    uid: memberToAdd.uid,
    name: memberToAdd.name,
    email: memberToAdd.email || '',
    role: memberToAdd.role || request.role || 'Teammate',
    isLeader: false,
    joinedAt: new Date().toISOString(),
  };

  const updatedMembers = [...currentMembers, newMember];

  await updateDoc(teamRef, {
    members: updatedMembers,
    updatedAt: serverTimestamp(),
  });

  // 3. Notify the applicant/sender
  await createNotification({
    userId: request.senderId,
    senderName: request.receiverName || 'Team Leader',
    type: 'request_accepted',
    title: 'Application Accepted! 🎉',
    message: `You have been added to "${request.teamName}". Welcome to the team!`,
    link: '/app/my-team',
    read: false,
  });
};

export const withdrawTeamRequest = async (requestId: string) => {
  const reqRef = doc(db, 'requests', requestId);
  const snap = await getDoc(reqRef);
  if (!snap.exists()) return;
  const request = snap.data() as TeamRequest;

  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(reqRef);

  await createNotification({
    userId: request.receiverId,
    senderName: request.senderName,
    type: 'team_update',
    title: 'Application Withdrawn',
    message: `${request.senderName} withdrew their application for "${request.teamName}".`,
    link: '/app/my-team',
    read: false,
  });
};

export const leaveTeam = async (teamId: string, userUid: string, userName: string) => {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) return;

  const currentTeam = sanitizeTeam({ id: teamSnap.id, ...teamSnap.data() } as Team);
  if (currentTeam.leaderId === userUid) {
    throw new Error('Team leader cannot leave the team. You must dismantle the team instead.');
  }

  const updatedMembers = (currentTeam.members || []).filter((m) => m.uid !== userUid);

  await updateDoc(teamRef, {
    members: updatedMembers,
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: currentTeam.leaderId,
    senderName: userName,
    type: 'team_update',
    title: 'Member Left Team',
    message: `${userName} has left team "${currentTeam.name}".`,
    link: '/app/my-team',
    read: false,
  });
};

export const purgeFakeData = async () => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const fakeNames = ['alpha leader', 'beta applicant', 'mahendra singh dhoni', 'dhoni', 'demo team'];

    // 1. Purge Fake / Test Users from `users` collection
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const d of usersSnap.docs) {
      const uData = d.data();
      const name = (uData.displayName || uData.name || '').toLowerCase();
      const email = (uData.email || '').toLowerCase();
      if (
        fakeNames.some((fn) => name.includes(fn)) ||
        email.includes('alpha') ||
        email.includes('beta') ||
        email.includes('dhoni')
      ) {
        await deleteDoc(d.ref);
      }
    }

    // 2. Purge Duplicate / Fake Teams & clean team members
    const teamsSnap = await getDocs(collection(db, 'teams'));
    const seenTeamNames = new Set<string>();

    for (const d of teamsSnap.docs) {
      const teamData = d.data();
      const teamName = (teamData.name || '').trim();
      const teamNameLower = teamName.toLowerCase();

      // Delete seed / fake teams
      if (
        teamNameLower.includes('cyberknights') ||
        teamNameLower.includes('neuralsquad') ||
        teamData.isSeed === true ||
        teamNameLower.includes('seed')
      ) {
        await deleteDoc(d.ref);
        continue;
      }

      // Check for duplicate team names (e.g. multiple "Alpha Titans" teams)
      if (seenTeamNames.has(teamNameLower)) {
        await deleteDoc(d.ref); // delete duplicate team
        continue;
      }
      seenTeamNames.add(teamNameLower);

      // Clean members array inside valid team doc if it contains test members
      if (teamData.members && Array.isArray(teamData.members)) {
        const cleanedMembers = teamData.members.filter((m: any) => {
          const mName = (m.name || m.displayName || '').toLowerCase();
          const mEmail = (m.email || '').toLowerCase();
          return !fakeNames.some((fn) => mName.includes(fn)) && !mEmail.includes('alpha') && !mEmail.includes('beta');
        });

        if (cleanedMembers.length !== teamData.members.length) {
          await updateDoc(d.ref, { members: cleanedMembers, updatedAt: serverTimestamp() });
        }
      }
    }

    // 3. Purge Fake Requests
    const reqsSnap = await getDocs(collection(db, 'requests'));
    for (const r of reqsSnap.docs) {
      const rData = r.data();
      const sName = (rData.senderName || '').toLowerCase();
      const rName = (rData.receiverName || '').toLowerCase();
      if (fakeNames.some((fn) => sName.includes(fn) || rName.includes(fn))) {
        await deleteDoc(r.ref);
      }
    }
  } catch (err) {
    console.warn('Error purging fake data:', err);
  }
};

export const rejectTeamRequest = async (request: TeamRequest) => {
  if (!request.id) return;

  const reqRef = doc(db, 'requests', request.id);
  await updateDoc(reqRef, {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    userId: request.senderId,
    senderName: request.receiverName || 'Team Leader',
    type: 'request_rejected',
    title: 'Application Update',
    message: `Your request to join "${request.teamName}" was declined.`,
    link: '/app/teams',
    read: false,
  });
};

export const removeTeamMember = async (teamId: string, memberUid: string) => {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) return;

  const currentTeam = sanitizeTeam({ id: teamSnap.id, ...teamSnap.data() } as Team);
  const updatedMembers = (currentTeam.members || []).filter((m) => m.uid !== memberUid);

  await updateDoc(teamRef, {
    members: updatedMembers,
    updatedAt: serverTimestamp(),
  });

  // Send notification to removed member
  await createNotification({
    userId: memberUid,
    senderName: currentTeam.leaderName || 'Team Leader',
    type: 'team_update',
    title: 'Removed from Team',
    message: `You have been removed from team "${currentTeam.name}".`,
    link: '/app/teams',
    read: false,
  });
};

export const deleteTeam = async (teamId: string) => {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) return;

  const currentTeam = sanitizeTeam({ id: teamSnap.id, ...teamSnap.data() } as Team);

  // Notify all non-leader members that team was dismantled
  const members = currentTeam.members || [];
  for (const member of members) {
    if (member.uid !== currentTeam.leaderId) {
      await createNotification({
        userId: member.uid,
        senderName: currentTeam.leaderName || 'Team Leader',
        type: 'team_update',
        title: 'Team Dismantled',
        message: `Team "${currentTeam.name}" has been dismantled by the leader.`,
        link: '/app/teams',
        read: false,
      });
    }
  }

  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(teamRef);
};

// ==========================================
// 3. NOTIFICATIONS OPERATIONS
// ==========================================
export interface AppNotification {
  id?: string;
  userId: string;
  senderId?: string;
  senderName?: string;
  type: 'request_received' | 'request_accepted' | 'request_rejected' | 'team_update';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt?: any;
}

export const createNotification = async (
  notification: Omit<AppNotification, 'id' | 'createdAt'>
) => {
  const notifRef = collection(db, 'notifications');
  return await addDoc(notifRef, {
    ...notification,
    read: false,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: AppNotification[]) => void,
  onError?: (error: any) => void
) => {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
        notifs.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || 0;
          const tB = b.createdAt?.toMillis?.() || 0;
          return tB - tA;
        });
        callback(notifs);
      },
      (err) => {
        console.warn('Notifications subscription warning:', err);
        onError?.(err);
        callback([]);
      }
    );
  } catch (e) {
    console.warn('Failed to attach notifications listener:', e);
    onError?.(e);
    callback([]);
    return () => {};
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  const ref = doc(db, 'notifications', notificationId);
  await updateDoc(ref, { read: true });
};

export const markAllNotificationsAsRead = async (notifications: AppNotification[]) => {
  const unread = notifications.filter((n) => !n.read && n.id);
  await Promise.all(
    unread.map((n) => {
      const ref = doc(db, 'notifications', n.id!);
      return updateDoc(ref, { read: true });
    })
  );
};

// ==========================================
// 4. USER DIRECTORY OPERATIONS
// ==========================================
export const getTeammates = async (): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    const users = snapshot.docs
      .map((d) => ({ ...d.data(), uid: d.id } as UserProfile))
      .filter((u) => !isTestMember(u.displayName || undefined, u.email || undefined));
    return users;
  } catch (err) {
    console.warn('Firestore getTeammates query failed, returning empty or fallback:', err);
    return [];
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ==========================================
// 5. CHAT & MESSAGING OPERATIONS
// ==========================================
export interface ChatMessage {
  id?: string;
  chatId: string; // teamId or conversationId
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type?: 'text' | 'voice' | 'file';
  audioUrl?: string;
  audioDuration?: number;
  createdAt?: any;
}

export interface Conversation {
  id: string; // composite e.g. userA_userB (sorted uids)
  participants: string[];
  participantData: {
    [uid: string]: {
      displayName: string;
      email?: string;
      role?: string;
      avatarUrl?: string;
    };
  };
  lastMessage?: {
    text: string;
    senderId: string;
    senderName?: string;
    read?: boolean;
    type?: 'text' | 'voice' | 'file';
    timestamp?: any;
  };
  updatedAt?: any;
  createdAt?: any;
}

/**
 * Get or create a 1-on-1 direct conversation document
 */
export const getOrCreateConversation = async (
  currentUser: { uid: string; displayName?: string; email?: string; role?: string },
  otherUser: { uid: string; displayName?: string; email?: string; role?: string }
): Promise<string> => {
  if (!currentUser?.uid || !otherUser?.uid) {
    throw new Error('Both users must be valid to start a conversation');
  }

  const convId = [currentUser.uid, otherUser.uid].sort().join('_');
  const convRef = doc(db, 'conversations', convId);
  const snap = await getDoc(convRef);

  if (!snap.exists()) {
    await setDoc(convRef, {
      participants: [currentUser.uid, otherUser.uid],
      participantData: {
        [currentUser.uid]: {
          displayName: currentUser.displayName || 'Hacker',
          email: currentUser.email || '',
          role: currentUser.role || 'Member',
        },
        [otherUser.uid]: {
          displayName: otherUser.displayName || 'Hacker',
          email: otherUser.email || '',
          role: otherUser.role || 'Member',
        },
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return convId;
};

/**
 * Real-time subscription to current user's direct conversations
 */
export const subscribeUserConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const convs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
        convs.sort((a, b) => {
          const tA = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
          const tB = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
          return tB - tA;
        });
        callback(convs);
      },
      (err) => {
        console.warn('Conversations subscription warning:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('Error subscribing to conversations:', err);
    callback([]);
    return () => {};
  }
};

/**
 * Real-time subscription to messages for a specific team chat or DM conversation
 */
export const subscribeChatMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  if (!chatId) return () => {};
  try {
    const q = query(collection(db, 'messages'), where('chatId', '==', chatId));
    return onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage));
        // Sort ascending by time for chat display
        msgs.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const tB = b.createdAt?.toMillis?.() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return tA - tB;
        });
        callback(msgs);
      },
      (err) => {
        console.warn('Messages subscription warning:', err);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('Error subscribing to chat messages:', err);
    callback([]);
    return () => {};
  }
};

/**
 * Send a message (Text or Voice)
 */
export const sendChatMessage = async (
  messageData: Omit<ChatMessage, 'id' | 'createdAt'>
): Promise<string> => {
  const msgsRef = collection(db, 'messages');
  const docRef = await addDoc(msgsRef, {
    ...messageData,
    type: messageData.type || 'text',
    createdAt: serverTimestamp(),
  });

  // If this is a DM conversation, update conversation's lastMessage
  if (messageData.chatId.includes('_')) {
    try {
      const convRef = doc(db, 'conversations', messageData.chatId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        await updateDoc(convRef, {
          lastMessage: {
            text: messageData.text,
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            read: false,
            timestamp: new Date().toISOString(),
          },
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn('Error updating conversation last message:', e);
    }
  }

  return docRef.id;
};

/**
 * Mark a DM conversation's last message as read for the current user
 */
export const markConversationAsRead = async (convId: string, currentUserId: string) => {
  if (!convId || !convId.includes('_')) return;
  try {
    const convRef = doc(db, 'conversations', convId);
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.lastMessage && data.lastMessage.senderId !== currentUserId && !data.lastMessage.read) {
        await updateDoc(convRef, {
          'lastMessage.read': true,
        });
      }
    }
  } catch (err) {
    console.warn('Error marking conversation as read:', err);
  }
};

/**
 * Helper to convert Blob to Base64 Data URL (fallback if Storage bucket throws)
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Upload voice recording to Firebase Storage with seamless Base64 data URI fallback
 */
export const uploadVoiceRecording = async (audioBlob: Blob, chatId: string): Promise<string> => {
  const filename = `voice_${Date.now()}.webm`;
  const path = `chat_audio/${chatId}/${filename}`;
  const audioRef = storageRef(storage, path);

  try {
    const snapshot = await uploadBytes(audioRef, audioBlob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload failed or restricted. Using Data URI fallback:', err);
    const dataUri = await blobToBase64(audioBlob);
    return dataUri;
  }
};


