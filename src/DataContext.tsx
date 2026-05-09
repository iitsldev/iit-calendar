import React, { createContext, useContext, useState, useEffect } from 'react';
import { FirebaseDataService, AppEvent, AppReflection } from './lib/services/FirebaseDataService';
import eventsData from './data/events.json';
import reflectionsData from './data/reflections.json';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface DataContextType {
  events: AppEvent[];
  reflections: AppReflection[];
  config: any;
  loading: boolean;
  user: User | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [reflections, setReflections] = useState<AppReflection[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    // Subscriptions
    const unsubEvents = FirebaseDataService.subscribeToEvents((data) => {
      setEvents(data);
      setLoading(false);
    });

    const unsubReflections = FirebaseDataService.subscribeToReflections((data) => {
      setReflections(data);
    });

    const unsubConfig = FirebaseDataService.subscribeToConfig((data) => {
      if (data) setConfig(data);
    });

    return () => {
      unsubscribeAuth();
      unsubEvents();
      unsubReflections();
      unsubConfig();
    };
  }, []);

  return (
    <DataContext.Provider value={{ events, reflections, config, loading, user }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
