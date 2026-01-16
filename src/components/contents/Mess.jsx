import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { useMessages } from "../../function/useMessage";

export default function Mess() {
    const [conv] = useState("c10");

    const api = useMessages(conv);
    const {
        items = [],
        send, edit, del,
        ready = false,
        runSync, runUpload, runPull, refresh,
        syncing, 
    } = api || {};

    const canUse = Boolean(ready && send && edit && del);

//     const req = indexedDB.deleteDatabase("chatdb_front");
// req.onsuccess = () => console.log("DB supprimée");
// req.onerror   = (e) => console.error("deleteDatabase error", e);
// req.onblocked = () => console.warn("Bloqué: ferme les autres onglets sur ce site");

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, Arial, sans-serif" }}>
            <h3 style={{ marginTop: 0 }}>Conversation {conv}</h3>

            {/* Barre d'outils de test minimaliste */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                <button
                    disabled={!canUse}
                    onClick={() => {
                        const id = uuid();
                        send({
                            _id: id,
                            conv_id: conv,
                            user_id: "u1",
                            role: "user",
                            content: "hello " + id.slice(0, 4),
                        });
                    }}
                >
                    Send
                </button>

                <button
                    disabled={!canUse || items.length === 0}
                    onClick={() => {
                        const first = items.find((x) => !x.deleted);
                        if (!first) return;
                        const updated = { ...first, content: (first.content || "") + " TTT" };
                        // base = doc avant modif
                        edit(updated, first);
                    }}
                >
                    Edit "TTT" (1er item)
                </button>

                <button
                    disabled={!canUse || items.length === 0}
                    onClick={() => {
                        const first = items.find((x) => !x.deleted);
                        if (!first) return;
                        del(first._id);
                    }}
                >
                    Delete (1er item)
                </button>


                <button disabled={!ready || syncing} onClick={() => runUpload?.()}>
                    Upload (push)
                </button>
                <button disabled={!ready || syncing} onClick={() => runPull?.()}>
                    Pull (quickfind)
                </button>
                <button disabled={!ready || syncing} onClick={() => runSync?.()}>
                    Upload + Pull
                </button>
                <button disabled={!ready} onClick={() => refresh?.()}>
                    Refresh local
                </button>

                <span style={{ opacity: .8 }}>
                    {ready ? "ready" : "init…"} {syncing ? "• syncing" : ""} • items: {items.filter(m => !m.deleted).length}
                </span>

                {/* Bouton Force Sync si disponible dans le hook */}
                {typeof runSync === "function" && (
                    <button disabled={!ready} onClick={() => runSync()}>
                        Force Sync
                    </button>
                )}

                <span style={{ opacity: 0.8 }}>
                    {ready ? "ready" : "init…"} • items: {items.filter((m) => !m.deleted).length}
                </span>
            </div>

            {/* Liste des messages */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items
                    .filter((m) => !m.deleted)
                    .map((m) => (
                        <li
                            key={m._id}
                            style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                                padding: "6px 0",
                                borderBottom: "1px solid #eee",
                            }}
                        >
                            <code style={{ opacity: 0.7, minWidth: 110, display: "inline-block" }}>
                                #{m.server_seq ?? "…"} | {m.role}
                            </code>
                            <span style={{ flex: 1, whiteSpace: "pre-wrap" }}>{m.content}</span>

                            <button
                                disabled={!canUse}
                                onClick={() => {
                                    const updated = { ...m, content: (m.content || "") + " TTT" };
                                    edit(updated, m);
                                }}
                            >
                                edit TTT
                            </button>

                            <button disabled={!canUse} onClick={() => del(m._id)}>
                                delete
                            </button>
                        </li>
                    ))}
            </ul>

            {!ready && <div style={{ opacity: 0.7, marginTop: 8 }}>Initialisation du cache local…</div>}
        </div>
    );
}
