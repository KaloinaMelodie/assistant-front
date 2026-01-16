import React, { useRef, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useConversations } from "../../function/useConversation";
import ChatMessage from "../element/ChatMessage";
import LoadingWriteComponent from "../element/LoadingWriteComponent";
import LoadingComponent from "../element/LoadingComponent";
import { useMessages } from "../../function/useMessage";
import { v4 as uuid } from "uuid";
import * as ui from "../bootstrap/bootstrap";
import { useAuth } from "../auth/AuthContext";
import RequireAuth from "../auth/RequireAuth";
import { buildAssistantHTML, buildApiPayload } from "../../function/htmlHelper";
import { useTranslation } from 'react-i18next';

export default function ConversationView() {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, groups } = useAuth();
    const userId = user?.sub;
    const convId = searchParams.get("id") || "";
    const convType = searchParams.get("type") || null;
    const routeKey = `${convId || 'home'}|${convType || 'none'}`;
    const [routeLoading, setRouteLoading] = useState(false);
    const [firstBatch, setFirstBatch] = useState(false);
    const { create: createConv, ready: convListReady, items: convList, refresh: refreshConv, syncing: syncingConv = false } = useConversations(userId) || {};
    const [showAlert, setShowAlert] = useState(false);
    const [pendingFirstSend, setPendingFirstSend] = useState(null);
    const { items = [], send, ready = false, syncing = false } = useMessages(convId);
    const messagesScrollRef = useRef(null);
    const endRef = useRef(null);
    const [draft, setDraft] = useState("");
    const taRef = useRef(null);
    const MIN_HEIGHT = 40;
    const MAX_HEIGHT = 160;
    const [writing, setWriting] = useState(false);
    const canUse = Boolean(ready && send);
    const isLoading = !!convId && (routeLoading || !ready) || syncing;
    const canSend = draft.trim().length > 0 && !writing && (convId ? canUse : Boolean(convType && createConv && convListReady));
    const [atBottom, setAtBottom] = useState(true);
    const [action, setAction] = useState("keep");
    const headerRef = useRef(null);
    const [isCompact, setIsCompact] = useState(false);
    const url = import.meta.env.VITE_I18N_BASE;
    const PARTITION_OPTIONS = isCompact
        ? [
            { value: "surveys_vector", label: "Form." },
            { value: "consoles_vector", label: "Cons." },
            { value: "documents_vector", label: "Docs." },
        ]
        : [
            { value: "surveys_vector", label: t('convers.formulaires') },
            { value: "consoles_vector", label: t('convers.consoles') },
            { value: "documents_vector", label: t('convers.documents') },
        ];

    const [partitions, setPartitions] = useState([]);

    function togglePartition(value) {
        setPartitions(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    }
    const autosize = (el) => {
        if (!el) return;
        el.style.height = "auto";
        const contentH = Math.max(el.scrollHeight, MIN_HEIGHT);
        const target = Math.min(contentH, MAX_HEIGHT);
        el.style.height = target + "px";
        el.style.overflowY = contentH > MAX_HEIGHT ? "auto" : "hidden";
    };

    const scrollToBottom = (behavior = "auto") => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior, block: "end" });
            return;
        }
        if (messagesScrollRef.current) {
            messagesScrollRef.current.scrollTo({
                top: messagesScrollRef.current.scrollHeight,
                behavior
            });
        }
    };

    function formatConversationTitle() {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `Conversation à ${hh}:${mm} ${day}/${month}/${year}`;
    }
    const handleSend = async () => {
        if (!canSend) return;

        const userText = draft.trim();
        setDraft("");
        requestAnimationFrame(shrinkTextareaToOneRow);

        if (convId) {
            // await sendUserThenSimulatedAssistant(convId, userText);
            await sendUserThenApiAssistant(convId, userText);
            return;
        }

        const newId = uuid();
        const type = convType || "navigation";

        try {
            await createConv?.({
                _id: newId,
                user_id: userId,
                type,
                title: formatConversationTitle(),
                created_at_client: Date.now(),
                deleted: false,
            });
            localStorage.setItem("force-conv-refresh", Date.now());
            window.dispatchEvent(new Event("force-conv-refresh"));
            refreshConv();
        } catch (e) {
            console.error("create conversation failed", e);
            return;
        }

        setPendingFirstSend(userText);

        navigate(`/index?id=${encodeURIComponent(newId)}&type=${encodeURIComponent(type)}`, { replace: true });

        // try {
        //     await send({
        //         _id: newId,
        //         conv_id: convId,
        //         user_id: userId,
        //         role: "user",
        //         content: userText,
        // created_at_client: Date.now(),
        //     });
        // } catch (e) {
        //     console.error("send(user) failed:", e);
        // }
        // scrollToBottom("smooth");
        // setWriting(true);
        // const t = setTimeout(async () => {
        //     const assistantId = uuid();
        //     try {
        //         await send({
        //             _id: assistantId,
        //             conv_id: convId,
        //             role: "assistant",
        //             content: `Réponse simulée : « ${userText} »`,
        //         });
        //     } catch (e) {
        //         console.error("send(assistant) failed:", e);
        //     } finally {
        //         setWriting(false);
        //         scrollToBottom("smooth");
        //     }
        // }, 1200);

    };

    const sendUserThenApiAssistant = async (activeConvId, userText) => {
        // 1) push message user
        try {
            await send?.({
                _id: uuid(),
                conv_id: activeConvId,
                user_id: userId,
                role: "user",
                content: userText,
                created_at_client: Date.now(),
            });
        } catch (e) {
            console.error("send(user) failed:", e);
        }
        scrollToBottom("smooth");

        // 2) appeler /search ou /training
        setWriting(true);
        try {
            // Historique minimal : les N derniers messages (ex: 8)
            const recent = (items || []).slice(-8).map(m => ({
                role: m.role,
                content: m.content,
            }));

            const payload = buildApiPayload({
                user,
                groups,
                history: recent,
                question: userText,
            });

            const endpoint = (convType === "formation") ? "/training" : "/search";
            if (endpoint === "/search" && partitions.length > 0) {
                payload.partitions = partitions;
            }
            const res = await fetch(`${url}${endpoint}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`API ${endpoint} failed: ${res.status}`);
            const data = await res.json();
            const html = buildAssistantHTML({ reply: data.reply, sources: data.sources });

            await send?.({
                _id: uuid(),
                conv_id: activeConvId,
                user_id: "bot",
                role: "assistant",
                content: html,
                created_at_client: Date.now(),
            });
        } catch (e) {
            console.error("send(assistant) api failed:", e);
            // await send?.({
            //     _id: uuid(),
            //     conv_id: activeConvId,
            //     user_id: "bot",
            //     role: "assistant",
            //     content: `<div data-rich="1" class="assistant-rich"><article class="assistant-reply"><p>Désolé, une erreur est survenue.</p><pre>${String(e)}</pre></article></div>`,
            // created_at_client: Date.now(),
            // });
        } finally {
            setWriting(false);
            scrollToBottom("smooth");
        }
    };

    const sendUserThenSimulatedAssistant = async (activeConvId, userText) => {
        try {
            await send?.({
                _id: uuid(),
                conv_id: activeConvId,
                user_id: userId,
                role: "user",
                content: userText,
                created_at_client: Date.now(),
            });
        } catch (e) {
            console.error("send(user) failed:", e);
        }
        scrollToBottom("smooth");

        setWriting(true);

        setTimeout(async () => {
            try {
                await send?.({
                    _id: uuid(),
                    conv_id: activeConvId,
                    user_id: "bot",
                    role: "assistant",
                    content: `Réponse simulée : « ${userText} »`,
                    created_at_client: Date.now(),
                });
            } catch (e) {
                console.error("send(assistant) failed:", e);
            } finally {
                setWriting(false);
                scrollToBottom("smooth");
            }
        }, 1000);
    };


    const shrinkTextareaToOneRow = () => {
        const el = taRef.current;
        if (!el) return;
        el.rows = 1;
        el.style.overflowY = "hidden";
        requestAnimationFrame(() => autosize(el));
    };

    const safeItems = (items || [])
        .filter(m => !m.deleted)
    // .sort((a, b) => {
    //     const sa = a.server_seq ?? Number.MAX_SAFE_INTEGER;
    //     const sb = b.server_seq ?? Number.MAX_SAFE_INTEGER;
    //     if (sa !== sb) return sa - sb;
    //     const ta = a.created_at_client ? new Date(a.created_at_client).getTime() : 0;
    //     const tb = b.created_at_client ? new Date(b.created_at_client).getTime() : 0;
    //     if (ta !== tb) return ta - tb;
    //     return String(a._id || "").localeCompare(String(b._id || ""));
    // });

    useEffect(() => {
        if (taRef.current) autosize(taRef.current);
    }, []);

    // useEffect(() => {
    //     const t = setTimeout(() => setLoading(false), 1200);
    //     return () => clearTimeout(t);
    // }, []);

    // ancien loading not ready
    useEffect(() => {
        if (ready) {
            requestAnimationFrame(() => scrollToBottom("auto"));
        }
    }, [ready, syncing]);

    useEffect(() => {
        if (items && items.length) scrollToBottom("smooth");
    }, [items?.length]);

    useEffect(() => {
        if (writing) scrollToBottom("smooth");
    }, [writing]);

    useEffect(() => {
        const el = messagesScrollRef.current;
        if (!el) return;

        const onScroll = () => {
            const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
            setAtBottom(nearBottom);
        };
        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (convId && pendingFirstSend && ready) {
            const txt = pendingFirstSend;
            setPendingFirstSend(null);
            // sendUserThenSimulatedAssistant(convId, txt);
            sendUserThenApiAssistant(convId, txt);
        }
    }, [convId, pendingFirstSend, ready]);

    useEffect(() => {
        setWriting(false);
        requestAnimationFrame(() => scrollToBottom("auto"));
    }, [convId]);

    useEffect(() => {
        setWriting(false);
        setFirstBatch(false);
        if (!convId) {
            setRouteLoading(false);
        } else {
            setRouteLoading(true);
        }
        requestAnimationFrame(() => scrollToBottom("auto"));
    }, [routeKey]);

    useEffect(() => {
        if (!convId) return;
        if (!firstBatch && Array.isArray(items)) {
            setFirstBatch(true);
            setRouteLoading(false);
        }
    }, [convId, items, firstBatch]);

    useEffect(() => {
        if (!headerRef.current) return;
        const ro = new ResizeObserver(([entry]) => {
            setIsCompact(entry.contentRect.width < 520);
        });
        ro.observe(headerRef.current);
        return () => ro.disconnect();
    }, []);

    const convExist = convId && convList?.some(c => c._id === convId);
    useEffect(() => {
        if (!convId || !convListReady || convExist || syncingConv) return;
        setShowAlert(true);

        const timeout = setTimeout(() => {
            setShowAlert(false);
            navigate("/index?type=navigation", { replace: true });
        }, 2500);

        return () => clearTimeout(timeout);
    }, [convId, convExist, convListReady, navigate, syncingConv]);

    useEffect(() => {
        const allowedTypes = ["navigation", "formation"];
        if (!allowedTypes.includes(convType)) {
            navigate(`/index?type=navigation`, { replace: true });
        }
    }, [convType, navigate]);



    return (
        <RequireAuth>
            <div className="chat-container">
                {showAlert && (
                    <div className="alert-container">
                        <ui.Alert variant="danger" dismissible onClose={() => setShowAlert(false)}>
                            {t('convers.alertcharger')} <b>{convId}</b>
                        </ui.Alert>
                    </div>
                )}
                <div className="chat-header" ref={headerRef}>
                    <div className="title" title="Conversation">{(convType === "formation") ? t('convers.formation') : t('convers.navigation')}</div>
                    <div className="grow-spacer" />
                    {convType === "navigation" && (
                        <div className="header-actions">
                            <div className="title"><small>{t('convers.filter')}:</small></div>
                            <ui.Toggle
                                className="nav-toggle"
                                value={partitions}
                                options={PARTITION_OPTIONS}
                                onChange={setPartitions}
                                size="xs"
                                aria-label="Partitions"
                                multiple="true"
                            />
                        </div>
                    )}
                </div>

                <div className="messages-scroll" ref={messagesScrollRef}>
                    {isLoading && convId ? (
                        <LoadingComponent width="100%" height="100%" label="Chargement de la discussion…" />
                    ) : (
                        <>
                            {convId && safeItems.map((m, i) => (

                                <ChatMessage key={i} role={m.role} content={m.content} time={m.time || ""} />

                            ))}
                            {writing && (
                                <div className="thinking-row">
                                    <LoadingWriteComponent width="auto" height="auto" label={`${t('convers.think')}…`} />
                                </div>
                            )}
                        </>
                    )}
                    {!convId && (
                        <div className="chat-home">
                            <div className="chat-hero">
                                <div className="chat-hero-icon">
                                    <i className={`fa ${(convType === "formation") ? "fa-graduation-cap" : "fa-magnifying-glass"}`} />
                                </div>
                                <h2 className="chat-hero-title">
                                    {convType === "formation" ? t('convers.assistant_formation') : t('convers.assistant_navigation')}
                                </h2>
                                <p className="chat-hero-subtitle">
                                    {convType === "formation" ? (
                                        <>
                                            {t('convers.sous_titre_formation')}
                                        </>
                                    ) : (
                                        <>
                                            {t('convers.sous_titre_navigation')}

                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="chat-quick-grid">
                                {convType === "formation" && (
                                    <>
                                        < button
                                            className="chat-quick-btn"
                                            onClick={() => setDraft("Quelle est la différence entre mWater et Solstice ?")}
                                        >
                                            <p></p>
                                            <div>
                                                <div className="q-title">{t('convers.qtitle1')}</div>
                                                <div className="q-desc">{t('convers.qdesc1')}</div>
                                            </div>
                                        </button>

                                        <button
                                            className="chat-quick-btn"
                                            onClick={() => setDraft("Quelle est la différence entre Portal et Surveyor dans mWater ?")}
                                        >
                                            <p></p>
                                            <div>
                                                <div className="q-title">{t('convers.qtitle2')}</div>
                                                <div className="q-desc">{t('convers.qdesc2')}</div>
                                            </div>
                                        </button>

                                        <button
                                            className="chat-quick-btn"
                                            onClick={() => setDraft("J’ai oublié mon mot de passe, comment puis-je le réinitialiser ?")}
                                        >
                                            <p></p>
                                            <div>
                                                <div className="q-title">{t('convers.qtitle3')}</div>
                                                <div className="q-desc">{t('convers.qdesc3')}</div>
                                            </div>
                                        </button>

                                        <button
                                            className="chat-quick-btn"
                                            onClick={() => setDraft("Comment exporter ou télécharger les données que j’ai collectées dans mWater ?")}
                                        >
                                            <p></p>
                                            <div>
                                                <div className="q-title">{t('convers.qtitle4')}</div>
                                                <div className="q-desc">{t('convers.qdesc4')}</div>
                                            </div>
                                        </button>
                                    </>
                                )}

                                {convType === "navigation" && (
                                    <>
                                        {/* NAVIGATION */}
                                        <button
                                            className="chat-quick-btn"
                                            onClick={() => setDraft("Résume les principales informations du rapport ou console sur la qualité de l’eau dans mWater.")}>
                                            <p></p>
                                            <div>
                                                <div className="q-title">{t('convers.qtitle5')}</div>
                                                <div className="q-desc">{t('convers.qdesc5')}</div>
                                            </div>
                                        </button>

                                        <button
                                            className="chat-quick-btn"
                                            onClick={() => setDraft("Quels sont les formulaires disponibles pour enregistrer des données sur les écoles ?")}>
                                            <p></p>
                                            <div>
                                                <div className="q-title">{t('convers.qtitle6')}</div>
                                                <div className="q-desc">{t('convers.qdesc6')}</div>
                                            </div>
                                        </button>

                                        <button
                                            className="chat-quick-btn"
                                            onClick={() => setDraft("Je cherche un document qui parle de guide d’utilisation.")}>
                                            <p></p>
                                            <div>
                                                <div className="q-title">{t('convers.qtitle7')}</div>
                                                <div className="q-desc">{t('convers.qdesc7')}</div>
                                            </div>
                                        </button>

                                        <button
                                            className="chat-quick-btn"
                                            onClick={() => setDraft("Je cherche une visualisation ou console qui parle du projet Mionjo.")}>
                                            <p></p>
                                            <div>
                                                <div className="q-title">{t('convers.qtitle8')}</div>
                                                <div className="q-desc">{t('convers.qdesc8')}</div>
                                            </div>
                                        </button>

                                    </>)}


                            </div>
                        </div>
                    )}
                </div>



                <div className="composer">
                    <textarea
                        ref={taRef}
                        className="composer-textarea"
                        placeholder={`${t('convers.inputplaceholder')}…`}
                        value={draft}
                        rows={1}
                        onChange={(e) => {
                            setDraft(e.target.value);
                            autosize(e.target);
                        }}
                        onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button className="composer-send"
                        onClick={handleSend}
                        disabled={!canSend}
                    >{t('convers.boutonsend')}</button>
                </div>
                {!atBottom && (
                    <button
                        className="scroll-bottom-btn"
                        onClick={() => scrollToBottom("smooth")}
                    >
                        <small><i className="fa fa-arrow-down"></i></small>
                    </button>
                )}


            </div>
        </RequireAuth >
    );
}
