
const LOGS_CACHE_KEY = "logs_cache_v1";
const LOGS_META_KEY  = "logs_cache_meta_v1";

export function loadCache() {
  try {
    const raw = localStorage.getItem(LOGS_CACHE_KEY);
    const metaRaw = localStorage.getItem(LOGS_META_KEY);
    if (!raw) return { items: [], meta: null };
    return {
      items: JSON.parse(raw),
      meta: metaRaw ? JSON.parse(metaRaw) : null,
    };
  } catch {
    return { items: [], meta: null };
  }
}

export function saveCache(items) {
  try {
    localStorage.setItem(LOGS_CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(
      LOGS_META_KEY,
      JSON.stringify({ lastUpdated: new Date().toISOString(), count: items?.length || 0 })
    );
  } catch {
  }
}

export function clearCache() {
  localStorage.removeItem(LOGS_CACHE_KEY);
  localStorage.removeItem(LOGS_META_KEY);
}

export const D = (v, { dash = true } = {}) => {
  if (v === null || v === undefined || v === "") {
    return dash ? <span className="text-muted">—</span> : "";
  }

  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) {
    try {
      const d = new Date(v);
      const formatted = d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return <span title={v}>{formatted}</span>;
    } catch {
      return v;
    }
  }

  return v;
};
