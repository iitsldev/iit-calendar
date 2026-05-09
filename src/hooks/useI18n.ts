import { useState, useEffect } from 'react';
import en from '../i18n/en.json';
import vi from '../i18n/vi.json';
import th from '../i18n/th.json';
import si from '../i18n/si.json';
import my from '../i18n/my.json';
import km from '../i18n/km.json';
import lo from '../i18n/lo.json';

const translations: Record<string, any> = {
  en, vi, th, si, my, km, lo
};

export const useI18n = () => {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const checkLang = () => {
      const saved = localStorage.getItem('iit_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.language && parsed.language !== lang) {
            setLang(parsed.language);
          }
        } catch(e) {}
      }
    };
    
    checkLang();
    
    // Poll for changes in case it's updated in the same window without a storage event
    const interval = setInterval(checkLang, 500);
    window.addEventListener('storage', checkLang);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkLang);
    };
  }, [lang]);

  const t = (path: string) => {
    const dict = translations[lang] || en;
    return path.split('.').reduce((obj, key) => obj?.[key], dict) || path.split('.').reduce((obj, key) => obj?.[key], en) || path;
  };

  return { t, language: lang };
};
