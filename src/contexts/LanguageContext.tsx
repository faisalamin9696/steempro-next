"use client";

import { Language, LanguagesCode, TranslationObject } from "@/types/language";
import { getSettings, updateSettings } from "@/utils/user";
import { createContext, useContext, useEffect, useState } from "react";

// Define available languages
export const languages: Language[] = [
  { title: "English", code: "en" },
  { title: "中文", code: "cn" },
];

// Default language
export const defaultLanguage: Language = languages[0];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLanguage,
  setLanguage: async () => {},
  t: (key: string, params?: Record<string, any>) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const [translations, setTranslations] = useState<Partial<TranslationObject>>({});
  
  // Load translations for a specific language
  const loadTranslations = async (langCode: LanguagesCode) => {
    try {
      // Dynamic import of translation files
      const translationModule = await import(`../translations/${langCode}.json`);
      setTranslations(translationModule.default);
    } catch (error) {
      console.error(`Failed to load translations for ${langCode}:`, error);
      // Fallback to empty translations if file doesn't exist
      setTranslations({});
    }
  };
  
  // Detect browser language
  const detectBrowserLanguage = (): Language => {
    if (typeof window === 'undefined') return defaultLanguage;
    
    // Get browser language and normalize it
    const browserLang = navigator.language.toLowerCase().split('-')[0];
    
    // Map browser language to supported language
    switch (browserLang) {
      case 'zh':
      case 'cn':
      case 'zh-tw':
      case 'zh-hk':
        return languages.find(lang => lang.code === 'cn') || defaultLanguage;
      default:
        return defaultLanguage;
    }
  };
  
  // Load language from settings or detect from browser
  useEffect(() => {
    const detectAndSetLanguage = async () => {
      // Try to get language from settings
      const settings = getSettings();
      
      if (settings.lang?.code) {
        const savedLanguage = languages.find(lang => lang.code === settings.lang.code);
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
          await loadTranslations(savedLanguage.code);
          return;
        }
      }
      
      // Detect browser language
      const detectedLanguage = detectBrowserLanguage();
      setCurrentLanguage(detectedLanguage);
      await loadTranslations(detectedLanguage.code);
    };
    
    detectAndSetLanguage();
  }, []);
  
  // Set language and update settings
  const setLanguage = async (lang: Language) => {
    setCurrentLanguage(lang);
    
    // Update settings
    const settings = getSettings();
    settings.lang = lang;
    updateSettings(settings);
    
    // Load translations
    await loadTranslations(lang.code);
  };
  
  // Translation function that supports nested keys like "common.settings"
  // Falls back to English if translation not found in current language
  // Also supports parameter substitution like {{param}}
  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let result: any = translations;
    
    // Try to get translation from current language
    for (const k of keys) {
      if (!result || !result[k]) {        
        // If current language is already English, just return the key
        if (currentLanguage.code === 'en') {
          return key;
        }
        
        // Try to get from English translations
        return fetchEnglishTranslation(key, params);
      }
      result = result[k];
    }
    
    let translatedText = typeof result === 'string' ? result : key;
    
    // Replace parameters if provided
    if (params && typeof translatedText === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translatedText = translatedText.replace(new RegExp(`\{\{${paramKey}\}\}`, 'g'), String(paramValue));
      });
    }
    
    return translatedText;
  };
  
  // Helper function to get translation from English
  const fetchEnglishTranslation = (key: string, params?: Record<string, any>): string => {
    try {
      // Dynamic import of English translation file
      // Note: This is a synchronous operation since we're in a render context
      // In a real implementation, you might want to preload English translations
      const enTranslations = require('../translations/en.json');
      
      const keys = key.split('.');
      let result: any = enTranslations;
      
      for (const k of keys) {
        if (!result || !result[k]) {
          return key; // Return original key if English translation not found
        }
        result = result[k];
      }
      
      let translatedText = typeof result === 'string' ? result : key;
      
      // Replace parameters if provided
      if (params && typeof translatedText === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translatedText = translatedText.replace(new RegExp(`\{\{${paramKey}\}\}`, 'g'), String(paramValue));
        });
      }
      
      return translatedText;
    } catch (error) {
      console.error('Error loading English fallback translations:', error);
      return key;
    }
  };
  
  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
