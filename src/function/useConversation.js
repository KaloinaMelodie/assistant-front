import { useEffect, useMemo, useRef, useState } from "react";
import { createHybridDb } from "./minimongo";

const toArr = async (x) => {
    if (!x) return [];
    if (typeof x.fetch === "function") {
        try { const arr = await x.fetch(); return Array.isArray(arr) ? arr : []; }
        catch { return []; }
    }
    return Array.isArray(x) ? x : [x];
};

function stripServerFields(d = {}) {
    const { rev, created_at_server, updated_at_server, server_seq, ...rest } = d || {};
    return rest;
}

function sortForView(list = []) {
    const withSeq = [];
    const pending = [];
    for (const d of list) {
        if (Number.isFinite(d?.server_seq)) withSeq.push(d);
        else pending.push(d);
    }
    withSeq.sort((a, b) => {
        if (a.server_seq !== b.server_seq) return a.server_seq - b.server_seq;
        const ta = timeMs(a.updated_at_server);
        const tb = timeMs(b.updated_at_server);
        if (ta !== tb) return ta - tb;
        return String(a._id).localeCompare(String(b._id));
    });
    pending.sort((a, b) => {
        const ta = a.created_at_client ?? timeMs(a.updated_at_server);
        const tb = b.created_at_client ?? timeMs(b.updated_at_server);
        if (ta !== tb) return ta - tb;
        return String(a._id).localeCompare(String(b._id));
    });
    return [...withSeq, ...pending];
}

function timeMs(x) {
    if (!x) return 0;
    if (typeof x === "number") return x;
    const t = Date.parse(x);
    return Number.isFinite(t) ? t : 0;
}

export function useConversations(user_id) {
    const [items, setItems] = useState([]);
    const [ready, setReady] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const refs = useRef(null);
    const syncingRef = useRef(false);
    const lastRunRef = useRef(0);
    const RUN_DEBOUNCE = 1500;

    useEffect(() => {        
        if(!user_id) return;
        let disposed = false;
        (async () => {
            try {
                const ctx = await createHybridDb();
                if (disposed) return;
                refs.current = ctx;
                setReady(true);
                runSync("mount");
            } catch (e) {
                console.error("DB init failed", e);
                setReady(false);
            }
        })();

        const onFocus = () => { if (document.visibilityState === "visible") runSync("focus"); };
        const onOnline = () => runSync("online");
        const onVisible = () => { if (document.visibilityState === "visible") runSync("visible"); };

        window.addEventListener("focus", onFocus);
        window.addEventListener("online", onOnline);
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            disposed = true;
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("online", onOnline);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [user_id]);

    async function findConversations(uid) {
        if (!refs.current) return;
        const { hybrid } = refs.current;
        const query = uid ? { user_id: uid, deleted: { $ne: true } } : { deleted: { $ne: true } };

        const cursor = await hybrid.conversations.find(
            query,
            { sort: [["server_seq", "asc"]], interim: true, cacheFind: true }
        );
        const docs = await toArr(cursor);
        setItems(sortForView(docs));
    }

    async function create(doc) {
        if (!refs.current) return console.warn("DB not ready");
        const { hybrid } = refs.current;
        const withClientTime = { ...doc, deleted: false, created_at_client: doc.created_at_client || Date.now() };
        await hybrid.conversations.upsert(withClientTime);
        await findConversations(doc.user_id);
    }

    async function edit(doc, base) {
        if (!refs.current) return console.warn("DB not ready yet");
        const { hybrid } = refs.current;
        const baseClean = stripServerFields(base || {});
        await hybrid.conversations.upsert(doc, baseClean);
        await findConversations(doc.user_id);
    }

    async function del(id) {
        if (!refs.current) return console.warn("DB not ready");
        const { hybrid, local } = refs.current;

        const curCursor = await local.conversations.find({ _id: id }, { limit: 1 });
        const curDocs = await toArr(curCursor);
        const current = curDocs[0];
        if (!current) {
            console.warn("del: doc not found", id);
            return;
        }
        
        const hasServerRev = Number.isFinite(current?.rev);
        const isProbablySynced = !!(hasServerRev || current?.server_seq || current?.created_at_server);
        let hasPending = false;
        try {
            if (typeof hybrid?.conversations?.hasPending === "function") {
                hasPending = !!(await hybrid.conversations.hasPending(id));
            } else if (typeof hybrid?.hasPending === "function") {
                hasPending = !!(await hybrid.hasPending("conversations", id));
            }
        } catch { }
        if (!isProbablySynced || hasPending) {
            console.warn("delete blocked: conversation not yet synced (or pending upload)");
            return;
        }

        const baseClean = stripServerFields(current);
        const docClean = { ...baseClean, _id: id, deleted: true };
        await hybrid.conversations.upsert(docClean, baseClean);
        await findConversations(baseClean.user_id || current.user_id || user_id);
    }

    async function quickfindPull(local, hybrid, BASE, uid) {
        const cur = await local.conversations.find(
            uid ? { user_id: uid } : {},
            { fields: { _id: 1, rev: 1, deleted: 1 } }
        );
        const localArr = await toArr(cur);
        const localSig = new Map(localArr.map(d => [d._id, `${d.rev || 0}:${d.deleted ? 1 : 0}`]));

        const res = await fetch(`${BASE}/conversations/quickfind`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: uid,
                client: [],
            }),
            credentials: "include",
        });
        if (!res.ok) return;
        const body = await res.json();

        const changed = [];
        for (const d of (body.docs || [])) {
            const sig = `${d.rev || 0}:${d.deleted ? 1 : 0}`;
            if (localSig.get(d._id) !== sig) changed.push(d);
        }

        if (changed.length) {
            await applyServerDocs(local, hybrid, "conversations", changed);
        }
    }

    async function applyServerDocs(local, hybrid, colName, docs) {
        if (!docs?.length) return;
        for (const d of docs) {
            try {
                if (local[colName]?.upsert?.length >= 3) {
                    await local[colName].upsert(d, undefined, { noPending: true, fromServer: true, remote: true });
                    continue;
                }
            } catch { }
            try {
                if (typeof local[colName]?.upsertFromServer === "function") {
                    await local[colName].upsertFromServer(d);
                    continue;
                }
                if (typeof hybrid[colName]?.applyRemote === "function") {
                    await hybrid[colName].applyRemote(d);
                    continue;
                }
            } catch { }
            try {
                const prev = hybrid?._captureLocalWrites;
                if (typeof prev !== "undefined") hybrid._captureLocalWrites = false;
                await local[colName].upsert(d);
                if (typeof prev !== "undefined") hybrid._captureLocalWrites = prev;
                continue;
            } catch { }
            await local[colName].upsert(d);
        }
    }

    async function refresh() {
        await findConversations(user_id);
    }

    async function runUpload() {
        if (!refs.current) return;
        const { hybrid } = refs.current;
        setSyncing(true);
        try {
            await hybrid.upload();
        } finally {
            setSyncing(false);
        }
    }

    async function runPull() {
        if (!refs.current) return;
        const { local, BASE, hybrid } = refs.current;
        setSyncing(true);
        try {
            await quickfindPull(local, hybrid, BASE, user_id);
            await findConversations(user_id);
        } finally {
            setSyncing(false);
        }
    }

    async function runSync(reason = "manual") {
        const ctx = refs.current;
        if (!ctx) return;
        const { hybrid, local, BASE } = ctx;
        if (!hybrid || !local) return;

        if (syncingRef.current) return;
        const now = Date.now();
        if (now - lastRunRef.current < RUN_DEBOUNCE) return;
        lastRunRef.current = now;

        setSyncing(true);
        try {
            syncingRef.current = true;
            await hybrid.upload();
            await quickfindPull(local, hybrid, BASE, user_id);
            await findConversations(user_id);
        } finally {
            syncingRef.current = false;
            setSyncing(false);
        }
    }

    useEffect(() => {
        if (ready) refresh();
    }, [ready]);

    return useMemo(() => ({
        items, create, edit, del, ready,
        runUpload, runPull, runSync, refresh, syncing
    }), [items, ready, syncing]);
}
