import React, { createContext, useContext, useState } from 'react';

// The practice timer started last. Starting one pauses any other that is running.
export type TimerClaim = { name: 'meditation' | 'chant'; at: number } | null;

interface UIContextType {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  timerClaim: TimerClaim;
  claimTimer: (name: 'meditation' | 'chant') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [timerClaim, setTimerClaim] = useState<TimerClaim>(null);
  // A new object on every start, so a repeated start still reaches the other timer
  const claimTimer = (name: 'meditation' | 'chant') => setTimerClaim({ name, at: Date.now() });

  return (
    <UIContext.Provider value={{ showSettings, setShowSettings, timerClaim, claimTimer }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
