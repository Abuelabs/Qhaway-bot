import React, { createContext, useContext, useState, useMemo } from 'react';
import { getTranslator } from '../i18n/translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'qhawaybot-language';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'es';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = useMemo(() => getTranslator(language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
