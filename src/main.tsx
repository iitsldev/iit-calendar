import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DataProvider } from './DataContext';
import { UIProvider } from './UIContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider>
      <UIProvider>
        <App />
      </UIProvider>
    </DataProvider>
  </StrictMode>,
);
