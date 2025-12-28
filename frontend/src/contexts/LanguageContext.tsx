import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { translations, languages, LanguageCode, Translations } from '../locales';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Get language from localStorage or default to Indonesian
    const savedLang = localStorage.getItem('language') as LanguageCode | null;
    return savedLang && translations[savedLang] ? savedLang : 'id';
  });

  // Get current language metadata
  const currentLang = languages.find(l => l.code === language);
  const isRTL = currentLang?.rtl || false;

  useEffect(() => {
    // Apply RTL direction to document root
    const root = document.documentElement;
    if (isRTL) {
      root.setAttribute('dir', 'rtl');
    } else {
      root.setAttribute('dir', 'ltr');
    }
    
    // Save to localStorage
    localStorage.setItem('language', language);
  }, [language, isRTL]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  }, []);

  // Get translations for current language
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export types for external use
export type { LanguageCode };
