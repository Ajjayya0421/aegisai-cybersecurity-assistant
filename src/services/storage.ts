import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, db } from './firebase';
import { ChatMessage, SecurityAnalysisResult, UserProfile, SecurityMetric } from '../types';

const INITIAL_DEMO_ANALYSIS: SecurityAnalysisResult = {
  id: 'seed-analysis-1',
  userId: 'demo',
  category: 'message',
  rawInput: 'URGENT: Your Corporate Microsoft 365 password expires in 2 hours. Click here to retain your credentials: https://secure-msoffice365-verify.com/login?token=892f2',
  riskLevel: 'CRITICAL',
  threatType: 'Credential Harvesting Phishing (BEC)',
  summary: 'Deceptive spear-phishing attack attempting to impersonate Microsoft 365 identity provider to steal enterprise credentials.',
  explanation: 'The message employs artificial urgency ("expires in 2 hours") and directs the user to a typosquatted domain (secure-msoffice365-verify.com) instead of the authentic microsoft.com or login.microsoftonline.com domain.',
  warningSigns: [
    'Artificial urgency forcing quick action without verification',
    'Lookalike spoofed domain name: secure-msoffice365-verify.com',
    'Unsolicited password expiration notification lacking organizational signature',
    'Opaque token query parameter designed for target tracking',
  ],
  defensiveActions: [
    { action: 'Do NOT click the link or submit any authentication credentials.', completed: true },
    { action: 'Report message to SOC / Security Team or flag via PhishAlarm/Report Phishing plugin.', completed: true },
    { action: 'Block domain "secure-msoffice365-verify.com" at firewall/DNS resolver level.', completed: false },
    { action: 'Verify authentic password policy in official IT portal if in doubt.', completed: false },
  ],
  technicalIndicators: ['secure-msoffice365-verify.com', 'token=892f2', 'Phishing lure: Password expiration'],
  mitreAttackTags: ['T1566.002 - Spearphishing Link', 'T1056 - Input Capture'],
  timestamp: Date.now() - 1000 * 60 * 45,
  bookmarked: true,
};

// ----------------------------------------------------
// AUTHENTICATION (Firebase Google Sign-In & Mock fallback)
// ----------------------------------------------------

export function subscribeToAuthChanges(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      // Check local storage for custom/demo session fallback
      const local = getCurrentUser();
      callback(local);
      return;
    }

    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setCurrentUser(data);
        callback(data);
      } else {
        // Create new Firestore document for user profile
        const newUser: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || 'user@aegis-security.io',
          displayName: fbUser.displayName || 'Cyber Security Analyst',
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          role: 'Cybersecurity Analyst',
          securityScore: 85,
          mfaEnabled: true,
        };
        await setDoc(userRef, newUser);
        
        // Seed initial threat analysis into user's private collection
        const seedAnalysis = { ...INITIAL_DEMO_ANALYSIS, id: 'seed-' + Date.now(), userId: fbUser.uid };
        await setDoc(doc(db, 'users', fbUser.uid, 'analyses', seedAnalysis.id), seedAnalysis);

        setCurrentUser(newUser);
        callback(newUser);
      }
    } catch (err) {
      console.warn('Firestore profile sync error (falling back to local):', err);
      const fallbackUser: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || 'user@aegis-security.io',
        displayName: fbUser.displayName || 'Cyber Security Analyst',
        photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        role: 'Cybersecurity Analyst',
        securityScore: 85,
        mfaEnabled: true,
      };
      setCurrentUser(fallbackUser);
      callback(fallbackUser);
    }
  });
}

export async function signInWithGoogleFirebase(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    const userRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      const updated = { ...existing, lastLoginAt: Date.now() };
      await updateDoc(userRef, { lastLoginAt: Date.now() });
      setCurrentUser(updated);
      return updated;
    }

    const newUser: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email || 'user@aegis-security.io',
      displayName: fbUser.displayName || 'Cyber Security Analyst',
      photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      role: 'Cybersecurity Analyst',
      securityScore: 85,
      mfaEnabled: true,
    };
    
    await setDoc(userRef, newUser);
    const seedAnalysis = { ...INITIAL_DEMO_ANALYSIS, id: 'seed-' + Date.now(), userId: fbUser.uid };
    await setDoc(doc(db, 'users', fbUser.uid, 'analyses', seedAnalysis.id), seedAnalysis);

    setCurrentUser(newUser);
    return newUser;
  } catch (err) {
    console.error('Firebase Google popup sign-in error:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Firebase sign-out error:', err);
  }
  localStorage.removeItem('aegis_current_user_id');
}

export function getCurrentUser(): UserProfile | null {
  const userId = localStorage.getItem('aegis_current_user_id');
  if (!userId) return null;
  const users = getAllUsers();
  return users[userId] || null;
}

export function getAllUsers(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem('aegis_registered_users');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (!user) {
    localStorage.removeItem('aegis_current_user_id');
    return;
  }
  const users = getAllUsers();
  users[user.uid] = user;
  localStorage.setItem('aegis_registered_users', JSON.stringify(users));
  localStorage.setItem('aegis_current_user_id', user.uid);
}

export function signInWithGoogleMock(email?: string, name?: string): UserProfile {
  const effectiveEmail = email || 'ajjayyanh@gmail.com';
  const effectiveName = name || effectiveEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
  const uid = 'analyst_' + effectiveEmail.replace(/[^a-zA-Z0-9]/g, '_');

  const existingUsers = getAllUsers();
  if (existingUsers[uid]) {
    const updated = {
      ...existingUsers[uid],
      lastLoginAt: Date.now(),
    };
    setCurrentUser(updated);
    return updated;
  }

  const newUser: UserProfile = {
    uid,
    email: effectiveEmail,
    displayName: effectiveName.charAt(0).toUpperCase() + effectiveName.slice(1),
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    role: 'Cybersecurity Analyst',
    securityScore: 85,
    mfaEnabled: true,
  };

  setCurrentUser(newUser);

  // Sync to Firestore if permitted
  setDoc(doc(db, 'users', uid), newUser).catch(() => {});
  const seeded = { ...INITIAL_DEMO_ANALYSIS, id: 'seed-' + Date.now(), userId: uid };
  saveUserAnalysis(uid, seeded).catch(() => {});

  return newUser;
}

// ----------------------------------------------------
// CHAT & SECURITY QUESTIONS (Firestore + Local Fallback)
// ----------------------------------------------------

export function getInitialWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome-msg',
    sender: 'assistant',
    content: `### Welcome to AegisAI Security Command 🛡️\n\nI am your dedicated **AI Cybersecurity Assistant**, powered by Google Gemini and connected to secure Cloud Firestore. I can assist you with:\n\n- **Threat Intelligence & Concepts**: Zero Trust, Ransomware prevention, OAuth vulnerabilities, XSS/SQLi defense.\n- **Security Analysis**: Triage suspicious phishing emails, deceptive URLs, and server logs.\n- **Hardening & Best Practices**: Cloud security posture, container isolation, MFA architectures, and blue-team incident response.\n\n*How can I assist your defense posture today?*`,
    timestamp: Date.now(),
    tags: ['System Briefing', 'Defensive AI', 'Firestore Secure'],
    suggestedFollowups: [
      'How do I detect a spear-phishing attack?',
      'What are the best practices for Zero Trust architecture?',
      'Explain how Log4j (CVE-2021-44228) works defensively',
    ],
  };
}

export function subscribeToUserChats(userId: string, callback: (chats: ChatMessage[]) => void): () => void {
  try {
    const chatsCol = collection(db, 'users', userId, 'chats');
    const q = query(chatsCol, orderBy('timestamp', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          const local = getLocalChats(userId);
          callback(local.length > 0 ? local : [getInitialWelcomeMessage()]);
          return;
        }
        const loaded: ChatMessage[] = [];
        snapshot.forEach((d) => loaded.push(d.data() as ChatMessage));
        callback(loaded);
      },
      (error) => {
        console.warn('Firestore chats snapshot error, using local fallback:', error);
        callback(getUserChats(userId));
      }
    );
  } catch (err) {
    console.warn('Firestore subscribe error:', err);
    callback(getUserChats(userId));
    return () => {};
  }
}

export function getUserChats(userId: string): ChatMessage[] {
  const local = getLocalChats(userId);
  return local.length > 0 ? local : [getInitialWelcomeMessage()];
}

function getLocalChats(userId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`aegis_chats_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveUserChatMessage(userId: string, message: ChatMessage): Promise<void> {
  // Update local cache
  const local = getLocalChats(userId);
  local.push(message);
  localStorage.setItem(`aegis_chats_${userId}`, JSON.stringify(local));

  // Persist to user's private Firestore subcollection
  try {
    const chatDocRef = doc(db, 'users', userId, 'chats', message.id);
    await setDoc(chatDocRef, { ...message, userId });
  } catch (err) {
    console.warn('Firestore chat save error (data stored locally):', err);
  }
}

export async function clearUserChats(userId: string): Promise<void> {
  localStorage.removeItem(`aegis_chats_${userId}`);

  try {
    const chatsCol = collection(db, 'users', userId, 'chats');
    const snap = await getDocs(chatsCol);
    const deletes = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletes);
  } catch (err) {
    console.warn('Firestore clear chats error:', err);
  }
}

// ----------------------------------------------------
// THREAT ANALYSES & AUDIT HISTORY (Firestore + Local Fallback)
// ----------------------------------------------------

export function subscribeToUserAnalyses(userId: string, callback: (analyses: SecurityAnalysisResult[]) => void): () => void {
  try {
    const analysesCol = collection(db, 'users', userId, 'analyses');
    const q = query(analysesCol, orderBy('timestamp', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          const local = getLocalAnalyses(userId);
          callback(local);
          return;
        }
        const loaded: SecurityAnalysisResult[] = [];
        snapshot.forEach((d) => loaded.push(d.data() as SecurityAnalysisResult));
        callback(loaded);
      },
      (error) => {
        console.warn('Firestore analyses snapshot error, using local fallback:', error);
        callback(getUserAnalyses(userId));
      }
    );
  } catch (err) {
    console.warn('Firestore subscribe analyses error:', err);
    callback(getUserAnalyses(userId));
    return () => {};
  }
}

export function getUserAnalyses(userId: string): SecurityAnalysisResult[] {
  return getLocalAnalyses(userId);
}

function getLocalAnalyses(userId: string): SecurityAnalysisResult[] {
  try {
    const raw = localStorage.getItem(`aegis_analyses_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveUserAnalysis(userId: string, analysis: SecurityAnalysisResult): Promise<void> {
  // Update local cache
  const analyses = getLocalAnalyses(userId);
  const existingIdx = analyses.findIndex((a) => a.id === analysis.id);
  if (existingIdx >= 0) {
    analyses[existingIdx] = analysis;
  } else {
    analyses.unshift(analysis);
  }
  localStorage.setItem(`aegis_analyses_${userId}`, JSON.stringify(analyses));
  updateUserSecurityScore(userId);

  // Persist to user's private Firestore collection
  try {
    const docRef = doc(db, 'users', userId, 'analyses', analysis.id);
    await setDoc(docRef, { ...analysis, userId });
  } catch (err) {
    console.warn('Firestore save analysis error:', err);
  }
}

export async function toggleAnalysisActionCompleted(
  userId: string,
  analysisId: string,
  actionIndex: number
): Promise<SecurityAnalysisResult | null> {
  const analyses = getLocalAnalyses(userId);
  const target = analyses.find((a) => a.id === analysisId);
  if (!target || !target.defensiveActions[actionIndex]) return null;

  target.defensiveActions[actionIndex].completed = !target.defensiveActions[actionIndex].completed;
  localStorage.setItem(`aegis_analyses_${userId}`, JSON.stringify(analyses));
  updateUserSecurityScore(userId);

  try {
    const docRef = doc(db, 'users', userId, 'analyses', analysisId);
    await updateDoc(docRef, { defensiveActions: target.defensiveActions });
  } catch (err) {
    console.warn('Firestore toggle action error:', err);
  }

  return target;
}

export async function toggleBookmarkAnalysis(userId: string, analysisId: string): Promise<void> {
  const analyses = getLocalAnalyses(userId);
  const target = analyses.find((a) => a.id === analysisId);
  if (!target) return;

  target.bookmarked = !target.bookmarked;
  localStorage.setItem(`aegis_analyses_${userId}`, JSON.stringify(analyses));

  try {
    const docRef = doc(db, 'users', userId, 'analyses', analysisId);
    await updateDoc(docRef, { bookmarked: target.bookmarked });
  } catch (err) {
    console.warn('Firestore toggle bookmark error:', err);
  }
}

export async function deleteUserAnalysis(userId: string, analysisId: string): Promise<void> {
  const analyses = getLocalAnalyses(userId).filter((a) => a.id !== analysisId);
  localStorage.setItem(`aegis_analyses_${userId}`, JSON.stringify(analyses));
  updateUserSecurityScore(userId);

  try {
    const docRef = doc(db, 'users', userId, 'analyses', analysisId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete analysis error:', err);
  }
}

export async function clearUserAnalyses(userId: string): Promise<void> {
  localStorage.removeItem(`aegis_analyses_${userId}`);
  updateUserSecurityScore(userId);

  try {
    const analysesCol = collection(db, 'users', userId, 'analyses');
    const snap = await getDocs(analysesCol);
    const deletes = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletes);
  } catch (err) {
    console.warn('Firestore clear analyses error:', err);
  }
}

function updateUserSecurityScore(userId: string): void {
  const user = getCurrentUser();
  if (!user || user.uid !== userId) return;

  const analyses = getLocalAnalyses(userId);
  let baseScore = 70;
  baseScore += Math.min(analyses.length * 3, 15);

  let completedActions = 0;
  analyses.forEach((a) => {
    completedActions += a.defensiveActions.filter((act) => act.completed).length;
  });
  baseScore += Math.min(completedActions * 2, 15);

  user.securityScore = Math.min(baseScore, 99);
  setCurrentUser(user);

  try {
    const userRef = doc(db, 'users', userId);
    updateDoc(userRef, { securityScore: user.securityScore }).catch(() => {});
  } catch {}
}

export function getUserSecurityMetrics(userId: string): SecurityMetric {
  const analyses = getLocalAnalyses(userId);
  const criticalThreats = analyses.filter((a) => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH').length;
  const user = getCurrentUser();

  return {
    totalAnalyses: analyses.length,
    criticalThreatsBlocked: criticalThreats,
    activeShieldStatus: criticalThreats > 3 ? 'ELEVATED' : 'OPTIMAL',
    postureScore: user?.securityScore || 85,
  };
}

export function exportUserData(userId: string): string {
  const user = getCurrentUser();
  const chats = getUserChats(userId);
  const analyses = getUserAnalyses(userId);

  const payload = {
    exportedAt: new Date().toISOString(),
    cloudFirestoreDatabase: 'calcium-mystery-flkcn',
    user,
    chats,
    analyses,
    securityPosture: getUserSecurityMetrics(userId),
  };

  return JSON.stringify(payload, null, 2);
}
