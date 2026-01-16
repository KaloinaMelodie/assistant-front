import { useEffect, useMemo, useState } from "react";
import * as ui from "../bootstrap/bootstrap";
import PopoverHelpComponent from "../element/PopoverHelpComponent";
import {loadCache, saveCache,clearCache, D} from "../../function/cacheHelper"

function useIsCompact() {
    const [isCompact, setIsCompact] = useState(() => window.innerWidth < 576);
    useEffect(() => {
        const onResize = () => setIsCompact(window.innerWidth < 576);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return isCompact;
}



// Troncature “douce” pour msg
function MsgCell({ text }) {
    if (!text) return <span className="text-muted">—</span>;
    return (
        <pre
            className="mb-0 small"
            style={{
                whiteSpace: "pre-wrap",
                maxHeight: 120,
                overflow: "auto",
            }}
            title={text}
        >
            {text}
        </pre>
    );
}

export default function Logs() {
    // MODIF ① : adapte l’URL si nécessaire
    const base = import.meta.env.VITE_I18N_BASE || "";
    const url = `${base}/logs`;
    const [lastUpdated, setLastUpdated] = useState(null);

    const isCompact = useIsCompact();

    // Liste / chargement
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadErr, setLoadErr] = useState("");

    // Recherche globale (toutes colonnes) + debounce
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
        return () => clearTimeout(t);
    }, [query]);

    // Filtre source via Toggle (multi)
    // MODIF ② : ajuste la liste des sources selon ton contexte
    const SOURCE_OPTIONS = isCompact
        ? [
            { value: "survey_workflow", label: "Survey" },
            { value: "console_workflow", label: "Cons." },
            { value: "page_workflow", label: "Page" },
            { value: "document_workflow", label: "Docs" },
        ]
        : [
            { value: "survey_workflow", label: "Survey workflow" },
            { value: "console_workflow", label: "Console workflow" },
            { value: "page_workflow", label: "Page workflow" },
            { value: "document_workflow", label: "Document workflow" },
        ];

    const [sources, setSources] = useState([]); // valeurs sélectionnées

    // Filtres additionnels (simples sélecteurs, optionnels)
    const [eventFilter, setEventFilter] = useState("");
    const [stageFilter, setStageFilter] = useState("");
    const [tagFilter, setTagFilter] = useState("");

    // Pagination (client-side)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Fetch list
    const fetchList = async (opt = { keepPage: false }) => {
        setLoading(true);
        clearCache(); setItems([]); setLastUpdated(null);
        setLoadErr("");
        try {
            const res = await fetch(url, {
                headers: { Accept: "application/json" },
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

            // tri par ts desc (si ts absent, tombe sur stage/event)
            data.data.sort((a, b) => {
                const A = (a?.ts || "").toString();
                const B = (b?.ts || "").toString();
                if (A && B) return B.localeCompare(A); // desc
                // fallback
                return (a?.stage || "").localeCompare(b?.stage || "", "fr") ||
                    (a?.event || "").localeCompare(b?.event || "", "fr");
            });

            setItems(data.data);
            saveCache(data.data);
            setLastUpdated(new Date().toISOString());
            if (!opt.keepPage) setPage(1);
        } catch (e) {
            setLoadErr("Impossible de charger les logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const { items: cached, meta } = loadCache();

        if (cached && cached.length > 0) {
            setItems(cached);
            if (meta?.lastUpdated) setLastUpdated(meta.lastUpdated);
        } else {
            fetchList();
        }
    }, []);

    // Quand la taille de page change → revenir à la première page
    useEffect(() => { setPage(1) }, [pageSize]);

    // Filtrage client-side
    const filtered = useMemo(() => {
        const q = debouncedQuery.toLowerCase();
        return items.filter((it) => {
            // Filtre source (si aucune source sélectionnée → tout passe)
            if (sources?.length > 0 && !sources.includes(it?.source)) return false;

            // Filtres simples
            if (eventFilter && (it?.event || "") !== eventFilter) return false;
            if (stageFilter && (it?.stage || "") !== stageFilter) return false;
            if (tagFilter && (it?.tag || "") !== tagFilter) return false;

            // Recherche globale sur toutes colonnes
            if (q) {
                const hay = [
                    it?.ts, it?.stage, it?.event, it?.msg, it?.tag, it?.source,
                    it?.attempt != null ? String(it.attempt) : "",
                    it?.waitMs != null ? String(it.waitMs) : "",
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [items, debouncedQuery, sources, eventFilter, stageFilter, tagFilter]);

    // Fenêtrage client
    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const clampedPage = Math.min(page, pageCount);
    const startIdx = (clampedPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, total);
    const paged = filtered.slice(startIdx, endIdx);

    // Options dynamiques pour filtres (issu des données)
    const eventOptions = useMemo(
        () =>
            Array.from(new Set(items.map((x) => x?.event).filter(Boolean))).sort((a, b) =>
                a.localeCompare(b, "fr")
            ),
        [items]
    );
    const stageOptions = useMemo(
        () =>
            Array.from(new Set(items.map((x) => x?.stage).filter(Boolean))).sort((a, b) =>
                a.localeCompare(b, "fr")
            ),
        [items]
    );
    const tagOptions = useMemo(
        () =>
            Array.from(new Set(items.map((x) => x?.tag).filter(Boolean))).sort((a, b) =>
                a.localeCompare(b, "fr")
            ),
        [items]
    );

    return (
        <div className="container py-4">
            <h3 className="mb-1">Consultation des logs workflows</h3>

            {/* Barre d’actions / Filtres */}
            <section className="card mb-3">
                <div className="card-body">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                        <h4 className="h5 mb-0">
                            Filtres{" "}
                            <small>
                                <PopoverHelpComponent>
                                    Recherche sur <b>toutes</b> les colonnes. Sélectionne une ou plusieurs sources avec le toggle.
                                </PopoverHelpComponent>
                            </small>
                        </h4>

                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => fetchList({ keepPage: true })}
                                disabled={loading}
                                title="Actualiser"
                            >
                                <i className={`fa fa-${loading ? "spinner fa-spin" : "rotate-right"}`} />{" "}
                                Actualiser
                            </button>
                        </div>
                    </div>

                    <div className="row g-2 align-items-end">
                        {/* Recherche globale */}
                        <div className="col-12 col-lg-4">
                            <label className="form-label">Recherche</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fa fa-search" />
                                </span>
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Recherche…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") setDebouncedQuery(query.trim());
                                    }}
                                />
                            </div>
                        </div>

                        {/* Toggle Sources */}
                        <div className="col-12 col-lg-8">
                            <label className="form-label">Sources :</label>
                            {/* Reprend ton composant Toggle et son API */}
                            <ui.Toggle
                                className="nav-toggle"
                                value={sources}
                                options={SOURCE_OPTIONS}
                                onChange={setSources}
                                size="xs"
                                aria-label="Sources"
                                multiple="true"
                            />
                        </div>

                        {/* Filtres additionnels */}
                        <div className="col-12 col-sm-4">
                            <label className="form-label">Event</label>
                            <select
                                className="form-select"
                                value={eventFilter}
                                onChange={(e) => setEventFilter(e.target.value)}
                            >
                                <option value="">(Tous)</option>
                                {eventOptions.map((ev) => (
                                    <option key={ev} value={ev}>
                                        {ev}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-sm-4">
                            <label className="form-label">Stage</label>
                            <select
                                className="form-select"
                                value={stageFilter}
                                onChange={(e) => setStageFilter(e.target.value)}
                            >
                                <option value="">(Tous)</option>
                                {stageOptions.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-sm-4">
                            <label className="form-label">Tag</label>
                            <select
                                className="form-select"
                                value={tagFilter}
                                onChange={(e) => setTagFilter(e.target.value)}
                            >
                                <option value="">(Tous)</option>
                                {tagOptions.map((tg) => (
                                    <option key={tg} value={tg}>
                                        {tg}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Liste + Pagination */}
            <section className="card">
                <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <h4 className="h5 mb-0">Logs</h4>
                        {loadErr && <div className="alert alert-warning py-1 px-2 mb-0">{loadErr}</div>}
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th style={{ width: "16%" }}>Timestamp</th>
                                    <th style={{ width: "10%" }}>Stage</th>
                                    <th style={{ width: "10%" }}>Event</th>
                                    <th style={{ width: "12%" }}>Source</th>
                                    <th style={{ width: "8%" }} className="text-end">Attempt</th>
                                    <th style={{ width: "10%" }} className="text-end">Wait (ms)</th>
                                    <th style={{ width: "10%" }}>Tag</th>
                                    <th style={{ width: "24%" }}>Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map((it, idx) => {
                                    const key = `${it.ts || "no-ts"}-${idx}`;
                                    const ev = (it?.event || "").toLowerCase();
                                    const eventVariant =
                                        ev === "success" ? "success" :
                                            ev === "retry" ? "warning" :
                                                ev.includes("error") ? "danger" :
                                                    "secondary";
                                    return (
                                        <tr key={key}>
                                            <td><code className="small">{D(it.ts)}</code></td>
                                            <td>{D(it.stage)}</td>
                                            <td>
                                                {it?.event ? (
                                                    <span className={`badge text-bg-${eventVariant}`}>{it.event}</span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td>
                                                {it?.source ? (
                                                    <span className="badge text-bg-info">{it.source}</span>
                                                ) : (
                                                    <span className="text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="text-end">{D(it.attempt)}</td>
                                            <td className="text-end">{D(it.waitMs)}</td>
                                            <td>{D(it.tag)}</td>
                                            <td><MsgCell text={it.msg} /></td>
                                        </tr>
                                    );
                                })}
                                {(!paged || paged.length === 0) && (
                                    <tr>
                                        <td colSpan={8} className="text-center text-muted py-4">
                                            {loading ? "Chargement…" : "Aucun log trouvé"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination + info + page size */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div className="text-muted small">
                            {total > 0 ? `${startIdx + 1}–${endIdx} sur ${total}` : "0 résultat"}
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <label className="form-label mb-0">Par page</label>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: 90 }}
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>

                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${clampedPage <= 1 ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                            Précédent
                                        </button>
                                    </li>

                                    {Array.from({ length: Math.min(pageCount, 7) }).map((_, i) => {
                                        const num = i + 1;
                                        return (
                                            <li key={num} className={`page-item ${num === clampedPage ? "active" : ""}`}>
                                                <button className="page-link" onClick={() => setPage(num)}>{num}</button>
                                            </li>
                                        );
                                    })}

                                    {pageCount > 7 && <li className="page-item disabled"><span className="page-link">…</span></li>}

                                    <li className={`page-item ${clampedPage >= pageCount ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
                                            Suivant
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
