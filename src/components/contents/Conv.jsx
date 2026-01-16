import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { useConversations } from "../../function/useConversation";

export default function Conv() {
    const [uid] = useState("u1");
    const api = useConversations(uid);
    const {
        items = [],
        create, edit, del,
        ready = false,
        runSync, runUpload, runPull, refresh,
        syncing,
    } = api || {};

    const canUse = Boolean(ready && create && edit && del);

    function formatConversationTitle() {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `Conversation à ${hh}:${mm} ${day}/${month}/${year}`;
    }


    return (
        <div style={{ padding: 16, fontFamily: "system-ui, Arial, sans-serif" }}>
            <h3 style={{ marginTop: 0 }}>Conversations (user: {uid})</h3>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                <button
                    disabled={!canUse}
                    onClick={() => {
                        const id = uuid();
                        create({
                            _id: id,
                            title: formatConversationTitle(),
                            type: "navigation",  
                            user_id: uid,
                        });
                    }}
                >
                    Create
                </button>

                <button
                    disabled={!canUse || items.length === 0}
                    onClick={() => {
                        const first = items.find((x) => !x.deleted);
                        if (!first) return;
                        const updated = { ...first, title: (first.title || "") + " *" };
                        edit(updated, first);
                    }}
                >
                    Edit title (1er)
                </button>

                <button
                    disabled={!canUse || items.length === 0}
                    onClick={() => {
                        const first = items.find((x) => !x.deleted && x.title.substring("à"));
                        console.log(first);
                        if (!first) return;
                        del(first._id);
                    }}
                >
                    Delete (1er)
                </button>

                <button disabled={!ready || syncing} onClick={() => runUpload?.()}>Upload (push)</button>
                <button disabled={!ready || syncing} onClick={() => runPull?.()}>Pull (quickfind)</button>
                <button disabled={!ready || syncing} onClick={() => runSync?.()}>Upload + Pull</button>
                <button disabled={!ready} onClick={() => refresh?.()}>Refresh local</button>

                <span style={{ opacity: .8 }}>
                    {ready ? "ready" : "init…"} {syncing ? "• syncing" : ""} • items: {items.filter(c => !c.deleted).length}
                </span>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items
                    .filter((c) => !c.deleted)
                    .map((c) => (
                        <li key={c._id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                            <code style={{ opacity: 0.7, minWidth: 130, display: "inline-block" }}>
                                #{c.server_seq ?? "…"} | {c.type}
                            </code>
                            <span style={{ flex: 1, whiteSpace: "pre-wrap" }}>{c.title}</span>
                        </li>
                    ))}
            </ul>

            {!ready && <div style={{ opacity: 0.7, marginTop: 8 }}>Initialisation du cache local…</div>}
        </div>
    );
}
