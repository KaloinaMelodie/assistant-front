import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
// import frCommon from "./locales/fr/common.json";
// import enCommon from "./locales/en/common.json";
// import frTopbar from "./locales/fr/topbar.json";
// import enTopbar from "./locales/en/topbar.json";

// const resources = {
//   fr: { common: frCommon, topbar: frTopbar },
//   en: { common: enCommon, topbar: enTopbar },
// };

i18n
  .use(Backend)
  .use(LanguageDetector)        // détecte ?lang=, localStorage, navigateur, etc.
  .use(initReactI18next)
  .init({
    // resources,
    fallbackLng: "fr",
    supportedLngs: ["fr", "en","mg"],
    ns: ["common", "topbar"],
    defaultNS: "common",
    nonExplicitSupportedLngs: true, // "mg-MG" => "mg"
    interpolation: { escapeValue: false },
    backend: {
      loadPath: import.meta.env.VITE_I18N_BASE + "/i18n/locales/{{lng}}/{{ns}}.json"
    },
    detection: {
      order: ["querystring", "localStorage", "cookie", "navigator"],
      caches: ["localStorage", "cookie"]
    }
  });

// (optionnel) tenir à jour l'attribut <html lang="...">
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
