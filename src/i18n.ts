import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "../public/locales/en/common.json";
import arTranslations from "../public/locales/ar/common.json";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
