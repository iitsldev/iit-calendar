import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MeditationSession } from '../types';

function getLocal<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function setLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

class MeditationService {
  async syncWithFirebase(userId: string) {
    if (!userId) return;

    try {
      const path = `users/${userId}/meditation_sessions`;
      const remoteSnapshot = await getDocs(collection(db, path));
      const remoteSessions = remoteSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as MeditationSession));
      
      const localStats = getLocal<{ sessions: MeditationSession[] }>('zen_meditation_stats', { sessions: [] });
      const localSessions = localStats.sessions || [];

      // Merge (union by ID)
      const mergedMap = new Map<string, MeditationSession>();
      remoteSessions.forEach(s => mergedMap.set(s.id, s));
      localSessions.forEach(s => mergedMap.set(s.id, s));
      
      const mergedSessions = Array.from(mergedMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Save locally
      setLocal('zen_meditation_stats', { sessions: mergedSessions });

      // Upload missing to Firebase
      const batch = writeBatch(db);
      const localSessionIdsToUpload = mergedSessions.filter(s => !remoteSessions.find(rs => rs.id === s.id));
      localSessionIdsToUpload.forEach(s => {
        const ref = doc(db, path, s.id);
        batch.set(ref, s);
      });

      await batch.commit();
    } catch (e) {
      console.warn('Meditation sync failed:', e);
    }
  }
}

export const meditationService = new MeditationService();
