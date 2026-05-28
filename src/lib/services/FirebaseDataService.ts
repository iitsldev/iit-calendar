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
    // 1. Initial load from local storage or bundled data
    const local = localStorage.getItem('app_events');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          callback(parsed);
        } else {
          callback([]);
        }
      } catch (e) {
        callback([]);
      }
    } else {
      callback([]);
    }

    // 2. Fetch from Firebase to update
    const q = collection(db, 'events');
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppEvent[];
      localStorage.setItem('app_events', JSON.stringify(events));
      callback(events);
    }, (error) => {
      console.warn('Could not fetch events from Firebase. Working offline.');
    });
  }

  static subscribeToReflections(callback: (reflections: AppReflection[]) => void) {
    const local = localStorage.getItem('app_reflections');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          callback(parsed);
        } else {
          callback(reflectionsData as AppReflection[]);
        }
      } catch (e) {
        callback(reflectionsData as AppReflection[]);
      }
    } else {
      callback(reflectionsData as AppReflection[]);
    }

    const q = collection(db, 'reflections');
    return onSnapshot(q, (snapshot) => {
      const reflections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppReflection[];
      localStorage.setItem('app_reflections', JSON.stringify(reflections));
      callback(reflections);
    }, (error) => {
      console.warn('Could not fetch reflections from Firebase. Working offline.');
    });
  }

  static subscribeToConfig(callback: (config: any) => void) {
    const local = localStorage.getItem('app_config');
    if (local) {
      try {
        callback(JSON.parse(local));
      } catch (e) {
        // no fallback
      }
    }

    return onSnapshot(doc(db, 'configs', 'calendar'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        localStorage.setItem('app_config', JSON.stringify(data));
        callback(data);
      }
    }, (error) => {
      console.warn('Could not fetch config from Firebase. Working offline.');
    });
  }
}
