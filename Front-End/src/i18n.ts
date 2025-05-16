import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import translationEnglish from '../src/locales/en/translation.json';
import translationSpanish from '../src/locales/es/translation.json';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        keySeparator: false,
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translations: translationEnglish
            },
            es: {
                translations: translationSpanish
            }
        },
        ns: ['translations'],
        defaultNS: 'translations'
    });

export default i18n;