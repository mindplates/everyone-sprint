import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LANGUAGES from './languages';

i18n.use(initReactI18next).init({
  resources: LANGUAGES,
  lng: 'ko',
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
