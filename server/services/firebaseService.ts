import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (in production, use service account key)
const serviceAccount: ServiceAccount = {
  projectId: "studentconnect-c9c12",
  clientEmail: "firebase-adminsdk@studentconnect-c9c12.iam.gserviceaccount.com",
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ""
};

let adminApp;
let adminDb;
let adminAuth;

try {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://studentconnect-c9c12-default-rtdb.firebaseio.com"
  });
  adminDb = getDatabase(adminApp);
  adminAuth = getAuth(adminApp);
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.log('Firebase Admin not configured, using in-memory storage');
}

export { adminDb, adminAuth };

// Firebase database structure helpers
export const dbPaths = {
  consultancies: 'consultancies',
  referralCodes: 'referralCodes',
  verifiedUsers: 'verifiedUsers',
  deviceSessions: 'deviceSessions',
  chatRooms: 'chatRooms',
  userActivity: 'userActivity',
  roomStats: 'roomStats',
  globalStats: 'globalStats'
};

// Save user data under consultancy structure for referral users
export const saveUserToConsultancy = async (consultancyName: string, referralCode: string, userData: any) => {
  if (!adminDb) return;
  
  try {
    const userPath = `${dbPaths.consultancies}/${consultancyName}/users/${referralCode}`;
    await adminDb.ref(userPath).set({
      ...userData,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    });
    console.log('User saved to consultancy:', consultancyName, referralCode);
  } catch (error) {
    console.error('Error saving user to consultancy:', error);
    throw error;
  }
};

// Get user data from consultancy structure
export const getUserFromConsultancy = async (consultancyName: string, referralCode: string) => {
  if (!adminDb) return null;
  
  try {
    const userPath = `${dbPaths.consultancies}/${consultancyName}/users/${referralCode}`;
    const snapshot = await adminDb.ref(userPath).once('value');
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting user from consultancy:', error);
    return null;
  }
};

// Save message to user's chat history under consultancy
export const saveMessageToUser = async (consultancyName: string, referralCode: string, message: any) => {
  if (!adminDb) return;
  
  try {
    const messagePath = `${dbPaths.consultancies}/${consultancyName}/users/${referralCode}/messages`;
    const messageRef = adminDb.ref(messagePath).push();
    await messageRef.set({
      ...message,
      timestamp: Date.now()
    });
    console.log('Message saved for user:', referralCode);
  } catch (error) {
    console.error('Error saving message to user:', error);
    throw error;
  }
};

// Get user's chat history
export const getUserChatHistory = async (consultancyName: string, referralCode: string) => {
  if (!adminDb) return [];
  
  try {
    const messagesPath = `${dbPaths.consultancies}/${consultancyName}/users/${referralCode}/messages`;
    const snapshot = await adminDb.ref(messagesPath).once('value');
    
    if (snapshot.exists()) {
      const messages = snapshot.val();
      return Object.values(messages);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user chat history:', error);
    return [];
  }
};

// Save verified user (non-referral users)
export const saveVerifiedUser = async (userId: string, userData: any) => {
  if (!adminDb) return;
  
  try {
    const userPath = `${dbPaths.verifiedUsers}/${userId}`;
    await adminDb.ref(userPath).set({
      ...userData,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    });
    console.log('Verified user saved:', userId);
  } catch (error) {
    console.error('Error saving verified user:', error);
    throw error;
  }
};

// Get verified user
export const getVerifiedUser = async (userId: string) => {
  if (!adminDb) return null;
  
  try {
    const userPath = `${dbPaths.verifiedUsers}/${userId}`;
    const snapshot = await adminDb.ref(userPath).once('value');
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting verified user:', error);
    return null;
  }
};

// Save consultancy data
export const saveConsultancy = async (consultancyId: string, consultancyData: any) => {
  if (!adminDb) return;
  
  try {
    const consultancyPath = `${dbPaths.consultancies}/${consultancyData.name}`;
    await adminDb.ref(consultancyPath).set({
      ...consultancyData,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    });
    console.log('Consultancy saved:', consultancyData.name);
  } catch (error) {
    console.error('Error saving consultancy:', error);
    throw error;
  }
};

// Save referral codes
export const saveReferralCodes = async (codes: any[]) => {
  if (!adminDb) return;
  
  try {
    const batch = {};
    codes.forEach(code => {
      batch[`${dbPaths.referralCodes}/${code.code}`] = code;
    });
    
    await adminDb.ref().update(batch);
    console.log('Referral codes saved:', codes.length);
  } catch (error) {
    console.error('Error saving referral codes:', error);
    throw error;
  }
};

export const createDeviceSession = async (userId: string, deviceId: string, referralCode?: string) => {
  if (!adminDb) return;
  
  const sessionData = {
    userId,
    deviceId,
    loginTime: Date.now(),
    isActive: true,
    referralCode: referralCode || null
  };
  
  await adminDb.ref(`${dbPaths.deviceSessions}/${userId}`).set(sessionData);
};

export const checkDeviceSession = async (userId: string, deviceId: string) => {
  if (!adminDb) return { canLogin: true, existingDevice: null };
  
  const sessionRef = adminDb.ref(`${dbPaths.deviceSessions}/${userId}`);
  const snapshot = await sessionRef.once('value');
  const session = snapshot.val();
  
  if (!session || !session.isActive) {
    return { canLogin: true, existingDevice: null };
  }
  
  if (session.deviceId === deviceId) {
    return { canLogin: true, existingDevice: null };
  }
  
  return { canLogin: false, existingDevice: session.deviceId };
};

export const switchDevice = async (userId: string, newDeviceId: string) => {
  if (!adminDb) return;
  
  await adminDb.ref(`${dbPaths.deviceSessions}/${userId}`).update({
    deviceId: newDeviceId,
    loginTime: Date.now()
  });
};

export const logoutDevice = async (userId: string) => {
  if (!adminDb) return;
  
  await adminDb.ref(`${dbPaths.deviceSessions}/${userId}`).update({
    isActive: false,
    logoutTime: Date.now()
  });
};

// Real-time activity tracking
export const updateUserActivity = async (userId: string, country: string) => {
  if (!adminDb) return;
  
  try {
    const activityPath = `${dbPaths.userActivity}/${userId}`;
    await adminDb.ref(activityPath).update({
      lastActive: Date.now(),
      currentCountry: country,
      isOnline: true
    });
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
};

// Increment message count for room
export const incrementMessageCount = async (country: string) => {
  if (!adminDb) return;
  
  try {
    const roomStatsPath = `${dbPaths.roomStats}/${country}`;
    const snapshot = await adminDb.ref(roomStatsPath).once('value');
    const currentStats = snapshot.val() || { totalMessages: 0, lastUpdated: Date.now() };
    
    await adminDb.ref(roomStatsPath).update({
      totalMessages: currentStats.totalMessages + 1,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error incrementing message count:', error);
  }
};

// Update room statistics
export const updateRoomStats = async (country: string, activeUsers: number) => {
  if (!adminDb) return;
  
  try {
    const roomStatsPath = `${dbPaths.roomStats}/${country}`;
    await adminDb.ref(roomStatsPath).update({
      activeUsers,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating room stats:', error);
  }
};

// Save global statistics
export const saveGlobalStats = async (stats: any) => {
  if (!adminDb) return;
  
  try {
    await adminDb.ref(dbPaths.globalStats).set({
      ...stats,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error saving global stats:', error);
  }
};

// Get real-time statistics
export const getRealTimeStats = async () => {
  if (!adminDb) return null;
  
  try {
    const snapshot = await adminDb.ref(dbPaths.globalStats).once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error getting real-time stats:', error);
    return null;
  }
};

// Listen to real-time changes
export const listenToRealTimeStats = (callback: (stats: any) => void) => {
  if (!adminDb) return () => {};
  
  const statsRef = adminDb.ref(dbPaths.globalStats);
  const listener = statsRef.on('value', (snapshot) => {
    const stats = snapshot.val();
    if (stats) {
      callback(stats);
    }
  });
  
  return () => statsRef.off('value', listener);
};

// Listen to user activity
export const listenToUserActivity = (callback: (activity: any) => void) => {
  if (!adminDb) return () => {};
  
  const activityRef = adminDb.ref(dbPaths.userActivity);
  const listener = activityRef.on('value', (snapshot) => {
    const activity = snapshot.val();
    if (activity) {
      callback(activity);
    }
  });
  
  return () => activityRef.off('value', listener);
};

// Listen to room statistics
export const listenToRoomStats = (callback: (roomStats: any) => void) => {
  if (!adminDb) return () => {};
  
  const roomStatsRef = adminDb.ref(dbPaths.roomStats);
  const listener = roomStatsRef.on('value', (snapshot) => {
    const roomStats = snapshot.val();
    if (roomStats) {
      callback(roomStats);
    }
  });
  
  return () => roomStatsRef.off('value', listener);
};