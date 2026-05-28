import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chant, UserChant, ChantSession } from '../types';
import defaultChants from '../data/chants.json';

function getLocal<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function setLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

class ChantService {
  private listeners: ((chants: UserChant[]) => void)[] = [];

  private notifyListeners() {
    const chants = this.getLocalChants();
    this.listeners.forEach(l => l(chants));
  }

  getLocalChants(): UserChant[] {
    const chants = getLocal<UserChant[]>('app_user_chants', []);
    if (chants.length === 0) {
      const mapped = defaultChants.map(c => ({
        id: c.id.toString(),
        title: c.name,
        chant: c.chant,
        totalCount: 0,
        lastUsed: 0,
        isCustom: false
      }));
      setLocal('app_user_chants', mapped);
      return mapped.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    }
    return chants.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
  }

  async getUserChants(userId?: string): Promise<UserChant[]> {
    return this.getLocalChants();
  }

  async addChant(userId: string | undefined, chant: Omit<UserChant, 'id' | 'totalCount'>): Promise<string> {
    const chants = this.getLocalChants();
    const newChant: UserChant = {
      ...chant,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      totalCount: 0,
      lastUsed: Date.now(),
      isCustom: true
    };
    chants.push(newChant);
    setLocal('app_user_chants', chants);
    this.notifyListeners();
    return newChant.id;
  }

  async deleteChant(userId: string | undefined, chantId: string): Promise<void> {
    const chants = this.getLocalChants();
    const updated = chants.filter(c => c.id !== chantId);
    setLocal('app_user_chants', updated);
    this.notifyListeners();
  }

  async logSession(userId: string | undefined, chantId: string, count: number): Promise<void> {
    const sessions = getLocal<ChantSession[]>('app_chant_sessions', []);
    const session: ChantSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      chantId,
      count,
      timestamp: Date.now()
    };
    sessions.push(session);
    setLocal('app_chant_sessions', sessions);

    const chants = this.getLocalChants();
    const chantIndex = chants.findIndex(c => c.id === chantId);
    if (chantIndex >= 0) {
      chants[chantIndex].totalCount += count;
      chants[chantIndex].lastUsed = Date.now();
      setLocal('app_user_chants', chants);
    }
    
    this.notifyListeners();
  }

  subscribeToUserChants(userId: string | undefined, callback: (chants: UserChant[]) => void) {
    this.listeners.push(callback);
    callback(this.getLocalChants());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async updateMilestone(userId: string | undefined, chantId: string, milestone: number): Promise<void> {
    const chants = this.getLocalChants();
    const chantIndex = chants.findIndex(c => c.id === chantId);
    if (chantIndex >= 0) {
      chants[chantIndex].milestone = milestone;
      setLocal('app_user_chants', chants);
      this.notifyListeners();
    }
  }

  async getSessionHistory(userId?: string): Promise<ChantSession[]> {
    const sessions = getLocal<ChantSession[]>('app_chant_sessions', []);
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }

  async syncWithFirebase(userId: string) {
    if (!userId) return;

    try {
      // 1. Fetch remote chants
      const chantsPath = `users/${userId}/chants`;
      const remoteChantsSnapshot = await getDocs(collection(db, chantsPath));
      const remoteChants = remoteChantsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserChant));

      // 2. Fetch remote sessions
      const sessionsPath = `users/${userId}/chant_sessions`;
      const remoteSessionsSnapshot = await getDocs(collection(db, sessionsPath));
      const remoteSessions = remoteSessionsSnapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        timestamp: d.data().timestamp?.toMillis() || Date.now()
      } as ChantSession));

      const localChants = this.getLocalChants();
      const localSessions = await this.getSessionHistory();

      // Merge Chants (prefer local if newer)
      const mergedChantsMap = new Map<string, UserChant>();
      remoteChants.forEach(c => mergedChantsMap.set(c.id, c));
      localChants.forEach(c => {
        const existing = mergedChantsMap.get(c.id);
        if (!existing || (c.lastUsed || 0) >= (existing.lastUsed || 0)) {
          mergedChantsMap.set(c.id, c);
        }
      });
      const mergedChants = Array.from(mergedChantsMap.values());

      // Merge Sessions (union)
      const mergedSessionsMap = new Map<string, ChantSession>();
      remoteSessions.forEach(s => mergedSessionsMap.set(s.id, s));
      localSessions.forEach(s => mergedSessionsMap.set(s.id, s));
      const mergedSessions = Array.from(mergedSessionsMap.values());

      // Save merged locally
      setLocal('app_user_chants', mergedChants);
      setLocal('app_chant_sessions', mergedSessions);
      this.notifyListeners();

      // Upload missing/newer to Firebase (batch)
      const batch = writeBatch(db);
      mergedChants.forEach(c => {
        const ref = doc(db, chantsPath, c.id);
        batch.set(ref, c, { merge: true });
      });

      // To avoid massive batches, only upload sessions not found in remote or diff
      const localSessionIdsToUpload = mergedSessions.filter(s => !remoteSessions.find(rs => rs.id === s.id));
      localSessionIdsToUpload.forEach(s => {
        const ref = doc(db, sessionsPath, s.id);
        batch.set(ref, {
          chantId: s.chantId,
          count: s.count,
          timestamp: s.timestamp
        });
      });

      await batch.commit();
    } catch (e) {
      console.warn('Sync failed:', e);
    }
  }
}

export const chantService = new ChantService();

