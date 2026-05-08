import en from '../i18n/en.json';

export const useI18n = () => {
  const t = (path: string) => {
    return path.split('.').reduce((obj, key) => obj?.[key], en as any) || path;
  };

  return { t };
};
