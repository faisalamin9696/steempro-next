export const locales = ['en', 'ur', 'hi', 'bn', 'ko', 'zh', 'es', 'ar', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ur: 'Urdu',
  hi: 'Hindi',
  bn: 'Bengali',
  ko: 'Korean',
  zh: 'Chinese',
  es: 'Spanish',
  ar: 'Arabic',
  pt: 'Portuguese'
};

export const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  en: 'ltr',
  ur: 'rtl',
  hi: 'ltr',
  bn: 'ltr',
  ko: 'ltr',
  zh: 'ltr',
  es: 'ltr',
  ar: 'rtl',
  pt: 'ltr'
};
