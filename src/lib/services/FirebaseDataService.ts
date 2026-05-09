import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  setDoc, 
  getDocs,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import eventsData from '../../data/events.json';
import reflectionsData from '../../data/reflections.json';

export enum OperationType {
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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
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

export interface AppEvent {
  id?: string;
  category: string;
  calendar_type: string;
  event_name?: string;
  month?: number;
  day?: number;
  year?: number;
  day_of_week?: string;
  time?: string;
  subject?: string;
}

export interface AppReflection {
  id: string;
  quote: string;
  author: string;
  source?: string;
}

export class FirebaseDataService {
  static subscribeToEvents(callback: (events: AppEvent[]) => void) {
    const q = collection(db, 'events');
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppEvent[];
      callback(events);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });
  }

  static subscribeToReflections(callback: (reflections: AppReflection[]) => void) {
    const q = collection(db, 'reflections');
    return onSnapshot(q, (snapshot) => {
      const reflections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppReflection[];
      callback(reflections);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reflections');
    });
  }

  static subscribeToConfig(callback: (config: any) => void) {
    return onSnapshot(doc(db, 'configs', 'calendar'), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'configs/calendar');
    });
  }
}
