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

export function useMessages(conv_id) {
    const [items, setItems] = useState([]);
    const [ready, setReady] = useState(false);
    const refs = useRef(null);
    const syncingRef = useRef(false);
    const lastRunRef = useRef(0);
    const RUN_DEBOUNCE = 1500;

    useEffect(() => {
        if (!conv_id) {
            setReady(false);
            setItems([]);     
            refs.current = null;
            return;
        }

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

        // const onFocus = () => { if (document.visibilityState === "visible") runSync("focus"); };
        const onOnline = () => runSync("online");
        // const onVisible = () => { if (document.visibilityState === "visible") runSync("visible"); };

        // window.addEventListener("focus", onFocus);
        window.addEventListener("online", onOnline);
        // document.addEventListener("visibilitychange", onVisible);

        return () => {
            disposed = true;
            // window.removeEventListener("focus", onFocus);
            window.removeEventListener("online", onOnline);
            // document.removeEventListener("visibilitychange", onVisible);
        };
    }, [conv_id]);

    async function findMessages(cid) {
        if (!refs.current) return;
        const { hybrid } = refs.current;

        const cursor = await hybrid.messages.find(
            { conv_id: cid, deleted: { $ne: true } },
            { sort: [["server_seq", "asc"]], interim: true, cacheFind: true }
        );

        const docs = await toArr(cursor);
        setItems(sortForView(docs));
    }

    function sortForView(list = []) {
        const withSeq = [];
        const pending = [];

        for (const d of list) {
            if (Number.isFinite(d?.server_seq)) withSeq.push(d);
            else pending.push(d);
        }

        withSeq.sort((a, b) => {
            // if (a.server_seq !== b.server_seq) return a.server_seq - b.server_seq;
            const ta = timeMs(a.created_at_client);
            const tb = timeMs(b.created_at_client);
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


    async function send(doc) {
        if (!refs.current) return console.warn("DB not ready");
        const { hybrid } = refs.current;

        const withClientTime = {
            ...doc,
            created_at_client: doc.created_at_client ||  Date.now(),
        };

        await hybrid.messages.upsert(doc);
        await findMessages(doc.conv_id);
    }


    async function edit(doc, base) {
        if (!refs.current) return console.warn("DB not ready yet");
        const { hybrid } = refs.current;
        const { created_at_server, updated_at_server, rev, server_seq, ...baseClean } = base || {};
        await hybrid.messages.upsert(doc, baseClean);
        await findMessages(doc.conv_id);
    }

    async function del(id) {
        if (!refs.current) return console.warn("DB not ready");
        const { hybrid } = refs.current;
        const curCursor = await hybrid.messages.find({ _id: id }, { limit: 1 });
        const curDocs = await toArr(curCursor);
        const current = curDocs[0];
        if (!current) {
            console.warn("del: doc not found", id);
            return;
        }

        const baseClean = stripServerFields(current);
        const docClean = { ...baseClean, _id: id, deleted: true };
        await hybrid.messages.upsert(docClean, baseClean);
        await findMessages(baseClean.conv_id || current.conv_id || conv_id);
    }


    function startSync(cid) {
        const { local, BASE, hybrid } = refs.current;
        let timer, running = false, backoff = 0;

        async function run() {
            if (running) return;
            running = true;
            try {
                await hybrid.upload();
                await quickfindPull(local, hybrid, BASE, cid);
                await findMessages(cid);
                backoff = 0;
            } catch (e) {
                console.warn("sync error", e);
                backoff = Math.min(300000, backoff ? backoff * 2 : 10000);
            } finally {
                running = false;
                clearTimeout(timer);
                timer = setTimeout(run, backoff || 90000);
            }
        }

        const onFocus = () => run();
        const onOnline = () => run();
        window.addEventListener("focus", onFocus);
        window.addEventListener("online", onOnline);
        run();

        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("online", onOnline);
            clearTimeout(timer);
        };
    }

    async function quickfindPull(local, hybrid, BASE, cid) {
        const cur = await local.messages.find(
            { conv_id: cid },
            { fields: { _id: 1, rev: 1, deleted: 1 } }
        );
        const localArr = await toArr(cur);
        const localSig = new Map(localArr.map(d => [d._id, `${d.rev || 0}:${d.deleted ? 1 : 0}`]));

        // 2) Quickfind serveur
        const res = await fetch(`${BASE}/messages/quickfind`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conv_id: cid,
                // tu peux mettre tes buckets ici si tu veux; [] force un full delta
                client: [],
            }),
            credentials: "include",
        });
        if (!res.ok) return;
        const body = await res.json();

        // 3) Ne garder que les documents réellement modifiés (rev/deleted)
        const changed = [];
        for (const d of body.docs || []) {
            const sig = `${d.rev || 0}:${d.deleted ? 1 : 0}`;
            if (localSig.get(d._id) !== sig) changed.push(d);
        }

        // 4) Appliquer les diffs côté local SANS créer de pendings
        if (changed.length) {
            await applyServerDocs(local, hybrid, "messages", changed);
        }
    }

    function md5(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
        return String(h);
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
            } catch {
            }

            await local[colName].upsert(d);
        }
    }

    const [syncing, setSyncing] = useState(false);

    async function refresh() {
        await findMessages(conv_id);
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
        const { local, BASE } = refs.current;
        setSyncing(true);
        try {
            await quickfindPull(local, hybrid, BASE, cid);
            await findMessages(conv_id);
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
            await quickfindPull(local, hybrid, BASE, conv_id);
            await findMessages(conv_id);
        } finally {
            syncingRef.current = false;
            setSyncing(false);
        }
    }

    return useMemo(() => ({
        items, send, edit, del, ready,
        runUpload, runPull, runSync, refresh, syncing
    }), [items, ready, syncing]);

}
