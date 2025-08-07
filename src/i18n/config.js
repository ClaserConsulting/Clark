import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEN from "./locales/en.json";
import translationIT from "./locales/it.json";
import translationDE from "./locales/de.json";
import translationFR from "./locales/fr.json";

const resources = {
  en: { translation: translationEN },
  it: { translation: translationIT },
  de: { translation: translationDE },
  fr: { translation: translationFR },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
