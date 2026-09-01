import React, { createContext, useContext, useState } from 'react';
import { bn } from './bn';
import { en } from './en';

export type Language = 'en' | 'bn';
type TranslationKeys = keyof typeof en;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
  formatCurrency: (amount: number, currencySymbol?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('bmm_lang') as Language) || 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('bmm_lang', newLang);
  };

  const t = (key: TranslationKeys): string => {
    const dict = lang === 'bn' ? bn : en;
    return (dict as any)[key] || (en as any)[key] || key;
  };

  const formatCurrency = (amount: number, currencySymbol = '৳'): string => {
    const formatted = Math.abs(amount).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const sign = amount < 0 ? '-' : '';
    return `${sign}${currencySymbol} ${formatted}`;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, formatCurrency }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
