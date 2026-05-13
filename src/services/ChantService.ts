import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Chant, UserChant, ChantSession, UserChantStats } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

class ChantService {
  private globalChantsCol = collection(db, 'chants');

  async getGlobalChants(): Promise<Chant[]> {
    try {
      const snapshot = await getDocs(this.globalChantsCol);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chant));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'chants');
      return [];
    }
  }

  async getUserChants(userId: string): Promise<UserChant[]> {
    const path = `users/${userId}/chants`;
    try {
      const col = collection(db, path);
      const snapshot = await getDocs(query(col, orderBy('lastUsed', 'desc')));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserChant));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }

  async addChant(userId: string, chant: Omit<UserChant, 'id' | 'totalCount'>): Promise<string> {
    const path = `users/${userId}/chants`;
    try {
      const col = collection(db, path);
      const docRef = await addDoc(col, {
        ...chant,
        totalCount: 0,
        lastUsed: Date.now(),
        isCustom: true
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  }

  async logSession(userId: string, chantId: string, count: number): Promise<void> {
    const sessionPath = `users/${userId}/chant_sessions`;
    const chantPath = `users/${userId}/chants/${chantId}`;
    
    try {
      const batch = writeBatch(db);
      
      // Create session
      const sessionRef = doc(collection(db, sessionPath));
      batch.set(sessionRef, {
        chantId,
        count,
        timestamp: serverTimestamp()
      });
      
      // Update user chant total
      const chantRef = doc(db, chantPath);
      batch.update(chantRef, {
        totalCount: increment(count),
        lastUsed: Date.now()
      });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${sessionPath} & ${chantPath}`);
    }
  }

  subscribeToUserChants(userId: string, callback: (chants: UserChant[]) => void) {
    const path = `users/${userId}/chants`;
    const q = query(collection(db, path), orderBy('lastUsed', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const chants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserChant));
      callback(chants);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }

  async updateMilestone(userId: string, chantId: string, milestone: number): Promise<void> {
    const path = `users/${userId}/chants/${chantId}`;
    try {
      await updateDoc(doc(db, path), { milestone });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  async getSessionHistory(userId: string): Promise<ChantSession[]> {
    const path = `users/${userId}/chant_sessions`;
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      } as ChantSession));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }
}

export const chantService = new ChantService();
