import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Basic i18n configuration
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        welcome: "Welcome to the Device Monitoring Dashboard",
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
