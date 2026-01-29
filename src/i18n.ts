import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const defaultNS = 'translation';
export const resources = {
  en: {
    translation: {
      Indata: 'Input data',
    },
  },
  sv: {
    translation: {
      Indata: 'Indata',
    },
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'sv',
    resources,
    fallbackLng: 'sv',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
