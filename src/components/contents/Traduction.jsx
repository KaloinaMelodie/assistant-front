import { useCallback, useEffect, useMemo, useState } from "react";
import PopoverHelpComponent from "../element/PopoverHelpComponent";
import { refreshTranslations } from "../../i18n";

/**
 * Props:
 * - baseLang: code de la langue de base (ex: "fr")
 * - languages: [{ code, name }]  // les "name" servent d'étiquettes UI
 * - namespaces?: string[]        // optionnel: limiter le calcul de progress à certains ns
 * - progressUrl?: string         // défaut: "/v1/i18n/progress"
 * - onTranslateAll?(codes: string[])
 * - onTranslate?(code: string)   // fallback si pas de onTranslateAll
 * - version, lastSync
 */
export default function Traduction({
  baseLang = "fr",
  languages = [
    { code: "fr", name: "Français" },
    { code: "en", name: "English" },
    { code: "mg", name: "Malagasy" },
  ],
  namespaces,
}) {
  const url = import.meta.env.VITE_I18N_BASE;

  const [progress, setProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [errorProgress, setErrorProgress] = useState("");

  const nameMap = useMemo(
    () => Object.fromEntries(languages.map(l => [l.code, l.name])),
    [languages]
  );

  const desiredTargets = useMemo(
    () => languages.filter(l => l.code !== baseLang).map(l => l.code),
    [languages, baseLang]
  );

  const fetchProgress = useCallback(async () => {
    setLoadingProgress(true);
    setErrorProgress("");
    try {
      const params = new URLSearchParams();
      if (desiredTargets.length) params.set("targets", desiredTargets.join(","));
      if (namespaces?.length) params.set("namespaces", namespaces.join(","));

      const res = await fetch(`${url}/i18n/progress?${params.toString()}`, {
        headers: { "Accept": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        if (import.meta.env.DEV) console.log(res.status);
        throw new Error();
      }
      const data = await res.json();
      setProgress(data);
    } catch (err) {
      setErrorProgress("Erreur de chargement");
    } finally {
      setLoadingProgress(false);
    }
  }, [baseLang, desiredTargets, namespaces]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const uiLanguages = useMemo(() => {
    const items = [{ code: baseLang, name: nameMap[baseLang] || baseLang, percent: 100 }];

    const targets = (progress?.targets || desiredTargets);
    for (const code of targets) {
      const pct = progress?.summary?.[code]?.percent ?? 0;
      items.push({ code, name: nameMap[code] || code, percent: pct });
    }

    return items.sort((a, b) => {
      const aBase = a.code === baseLang ? -1 : 0;
      const bBase = b.code === baseLang ? -1 : 0;
      if (aBase !== bBase) return aBase - bBase;
      return a.name.localeCompare(b.name, "fr");
    });
  }, [progress, baseLang, nameMap, desiredTargets]);

  // Traduction
  const [translating, setTranslating] = useState(false);
  const [translateMsg, setTranslateMsg] = useState("");
  const [translateErr, setTranslateErr] = useState("");

  const handleTranslateAll = async () => {
    const targets = uiLanguages.filter(l => l.code !== baseLang).map(l => l.code);
    if (!targets.length) return;

    setTranslating(true);
    setTranslateMsg("");
    setTranslateErr("");
    try {
      const body = {
        namespaces: namespaces?.length ? namespaces : [],
        from: baseLang,
        to: targets,
        mode: "missing",
        dry_run: false,
      };

      const res = await fetch(url + "/i18n/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);

      setTranslateMsg("Traduction réussie");
      // refresh progress
      await fetchProgress();
    } catch (e) {
      setTranslateErr("Erreur lors de la traduction");
    } finally {
      setTranslating(false);
    }
  };

  // Sync
  const [version, setVersion] = useState(localStorage.getItem("i18n_version") || "");
  const [lastSync, setLastSync] = useState(Number(localStorage.getItem("i18n_last_sync") || 0));

  return (
    <div className="container py-4">
      <h3 className="mb-1">
        Gestion des traductions{" "}
        <small>
          <PopoverHelpComponent>
            Administre les langues, lance les traductions et synchronise la version en cache.
          </PopoverHelpComponent>
        </small>
      </h3>

      {/* Section Langues */}
      <section className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-3">
            <h4 className="h5 mb-0">Langues</h4>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={fetchProgress}
                disabled={loadingProgress}
              >
                Actualiser
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTranslateAll}
                disabled={uiLanguages.filter(l => l.code !== baseLang).length === 0 || translating}
                title={
                  uiLanguages.filter(l => l.code !== baseLang).length
                    ? `Traduire: ${uiLanguages.filter(l => l.code !== baseLang).map(l => l.code).join(", ")}`
                    : "Aucune langue à traduire"
                }
              >
                {translating ? "Traduction…" : (
                  uiLanguages.filter(l => l.code !== baseLang).length
                    ? `Traduire: ${uiLanguages.filter(l => l.code !== baseLang).map(l => l.code).join(", ")}`
                    : "Aucune langue à traduire"
                )}
              </button>
            </div>
          </div>

          {translateMsg && <div className="alert alert-success mb-3">{translateMsg}</div>}
          {translateErr && <div className="alert alert-danger mb-3">{translateErr}</div>}
          {errorProgress && <div className="alert alert-warning mb-3">{errorProgress}</div>}

          <ul className="list-group">
            {uiLanguages.map(({ code, name, percent }) => {
              const isBase = code === baseLang;
              const pct = Math.max(0, Math.min(100, Number(percent ?? 0)));
              return (
                <li key={code} className="list-group-item">
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center gap-2">
                      <strong>{name}</strong>
                      {isBase ? (
                        <span className="badge rounded-pill bg-secondary">Langue de base</span>
                      ) : (
                        <span className="text-muted small">{pct}% traduit</span>
                      )}
                    </div>

                    {!isBase && (
                      <div
                        className="progress mt-2"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div className="progress-bar" style={{ width: `${pct}%` }}>
                          {pct}%
                        </div>
                      </div>
                    )}

                    {isBase && (
                      <div className="small text-muted mt-1">
                        Le contenu est rédigé en {name}. Les autres langues se traduisent à partir de celle-ci.
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {loadingProgress && (
            <div className="text-muted small mt-2">Chargement des pourcentages…</div>
          )}
        </div>
      </section>

      {/* Section Synchronisation */}

      <section className="card">
        <div className="card-body">
          <h4 className="h5 mb-2">Synchroniser le cache</h4>
          <p className="text-muted mb-3">
            Mets à jour la version de traduction stockée côté client (<code>i18n_version</code>) pour forcer le rechargement.
          </p>

          <div className="d-flex flex-wrap align-items-center gap-3">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={async () => {
                const r = await refreshTranslations(["fr", "en", "mg"], ["common", "topbar"], { bumpVersion: true });
                if (r.ok) {
                  setVersion(String(r.version));
                  setLastSync(r.lastSync);
                }
                await fetchProgress();
              }}
            >
              Synchroniser
            </button>

            <div className="small">
              Version actuelle : <span className="fw-semibold">{version || "—"}</span>
            </div>
            {lastSync ? (
              <div className="small text-muted">Dernière synchro : {new Date(lastSync).toLocaleString()}</div>
            ) : null}

          </div>
        </div>
      </section>
    </div>
  );
}
