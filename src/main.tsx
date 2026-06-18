import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DataProvider } from './DataContext';
import { UIProvider } from './UIContext';
import { PrivacyScreen } from './screens/PrivacyScreen';

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/privacy' ? (
      <PrivacyScreen />
    ) : (
      <DataProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </DataProvider>
    )}
  </StrictMode>,
);
