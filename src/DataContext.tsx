import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadDataFile, updateDataFileInBackground } from './services/dataLoader';
import eventsDataDefault from './data/events.json';
import reflectionsDataDefault from './data/reflections.json';

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

interface DataContextType {
  events: AppEvent[];
  reflections: AppReflection[];
  config: any;
  loading: boolean;
  user: null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawEvents, setRawEvents] = useState<any>(() => loadDataFile('events.json', eventsDataDefault));
  const [rawReflections, setRawReflections] = useState<any>(() => loadDataFile('reflections.json', reflectionsDataDefault));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for updates in the background once a day
    updateDataFileInBackground('events.json', (updatedEvents) => {
      setRawEvents(updatedEvents);
    });

    updateDataFileInBackground('reflections.json', (updatedReflections) => {
      setRawReflections(updatedReflections);
    });
  }, []);

  // Map events to the flat list expected by screens
  const events = React.useMemo(() => {
    const categories = [
      { key: 'srilanka_events', name: 'srilanka' },
      { key: 'myanmar_events', name: 'myanmar' },
      { key: 'thai_events', name: 'thai' },
      { key: 'vietnam_events', name: 'vietnam' },
      { key: 'IIT_2027_schedule', name: 'IIT_2027_schedule' }
    ];

    const parsedEvents: AppEvent[] = [];
    categories.forEach(cat => {
      const items = rawEvents[cat.key] || [];
      items.forEach((item: any, idx: number) => {
        parsedEvents.push({
          id: `${cat.name}_${idx}`,
          ...item,
          category: cat.name
        });
      });
    });
    return parsedEvents;
  }, [rawEvents]);

  // Map reflections to include default author if not present
  const reflections = React.useMemo(() => {
    return rawReflections.map((r: any, idx: number) => ({
      id: r.id || `reflection_${idx}`,
      quote: r.quote,
      author: r.author || 'Buddha',
      source: r.source || ''
    }));
  }, [rawReflections]);

  return (
    <DataContext.Provider value={{ events, reflections, config: null, loading, user: null }}>
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
