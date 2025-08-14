import { useLanguage, languages } from "@/contexts/LanguageContext";
import { Language, LanguagesCode } from "@/types/language";

/**
 * Custom hook for translating text
 * @returns Translation function and language utilities
 * @example
 * const { t } = useTranslation();
 * return <div>{t('common.settings')}</div>;
 */
export const useTranslation = () => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  
  /**
   * Change language and reload the page to apply changes
   * @param lang Language to set
   */
  const changeLanguage = (lang: Language | LanguagesCode) => {
    if (typeof lang === 'string') {
      // If lang is a language code, find the corresponding language object
      const langObj = languages.find(l => l.code === lang);
      if (langObj) {
        setLanguage(langObj);
        setTimeout(() => window.location.reload(), 100);
      }
    } else {
      // If lang is already a Language object
      setLanguage(lang);
      setTimeout(() => window.location.reload(), 100);
    }
  };
  
  return {
    t,
    currentLanguage,
    setLanguage,
    changeLanguage
  };
};
