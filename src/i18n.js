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

const base = import.meta.env.VITE_I18N_BASE || "";
// const v = (typeof window !== "undefined" && localStorage.getItem("i18n_version")) || "";

const buildUrl = (lng, ns) => {
  const v = (typeof window !== "undefined" && localStorage.getItem("i18n_version")) || "";
  const url = `${base}/i18n/locales/${lng}/${ns}.json?v=${v}`;
  return url;
};

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
    load: "languageOnly",
    backend: {
      // ?v=<version persistée>
      loadPath: (lng, ns) => buildUrl(lng, ns),
      // caches réseau
      requestOptions: (import.meta.env.VITE_I18N_NO_STORE===true) ? { cache: "no-store" } : undefined,
    },
    detection: {
      order: ["querystring", "localStorage", "cookie", "navigator"],
      caches: ["localStorage", "cookie"],
    },
  });
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});


export async function refreshTranslations(
  lngs = [i18n.language],
  ns = ["common", "topbar"],
  { bumpVersion = true } = {}
) {
  try {
    const newV = bumpVersion ? Date.now().toString() : (localStorage.getItem("i18n_version") || Date.now().toString());
    if (bumpVersion) localStorage.setItem("i18n_version", newV);

    // applique aussi la query v côté backend i18next
    const backend = i18n.services?.backendConnector?.backend;
    if (backend?.options) {
      backend.options.queryStringParams = { ...(backend.options.queryStringParams || {}), v: newV };
    }

    // vide les bundles pour forcer le refetch
    for (const lng of lngs) {
      for (const n of ns) {
        try { i18n.removeResourceBundle(lng, n); } catch {}
      }
    }

    await i18n.reloadResources(lngs, ns);
    // remet la langue courante pour s'assurer que la UI réutilise les nouvelles ressources
    i18n.changeLanguage(i18n.language);

    // last sync
    const ts = Date.now();
    localStorage.setItem("i18n_last_sync", String(ts));

    return { ok: true, version: newV, lastSync: ts, languages: lngs, namespaces: ns };
  } catch (e) {
    return { ok: false, error: e?.message || "refreshTranslations failed" };
  }
}


{/* <button onClick={() => refreshTranslations()}>
                    Recharger traductions 
                </button>     */}