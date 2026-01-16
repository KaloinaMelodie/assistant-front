import { NavLink, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useConversations } from '../../function/useConversation';
import styles from './SideBar.module.css';
import LoadingRoundComponent from '../element/LoadingRoundComponent';
import { useLocation } from 'react-router-dom';
import { useAuth } from "../auth/AuthContext";
import RequireAuth from '../auth/RequireAuth';
import { useTranslation } from 'react-i18next';

function SideBarContent({ includeTitle = true }) {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const userId = user?.sub;
    const activeType = searchParams.get("type");
    const selectedId = searchParams.get("id") || null;
    const { items: convs = [], ready, edit, del, refresh, syncing } = useConversations(userId) || {};
    useEffect(() => {
        const handler = () => refresh?.();
        window.addEventListener("force-conv-refresh", handler);
        return () => window.removeEventListener("force-conv-refresh", handler);
    }, []);

    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [menuPos, setMenuPos] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [draftTitle, setDraftTitle] = useState("");
    const inputRef = useRef(null);
    const menuRef = useRef(null);
    const triggerRef = useRef(null);
    const location = useLocation();
    const [filterText, setFilterText] = useState("");


    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/gi, "");
    }


    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    useEffect(() => {
        function onGlobalMousedown(e) {
            const menuEl = menuRef.current;
            const trigEl = triggerRef.current;
            const inputEl = inputRef.current;
            if (menuEl && !menuEl.contains(e.target) && trigEl && !trigEl.contains(e.target)) {
                setMenuOpenFor(null);
            }
            if (editingId) {
                if (inputEl && inputEl.contains && inputEl.contains(e.target)) {
                    return;
                }
                setEditingId(null);
                setDraftTitle("");
            }
        }
        document.addEventListener("mousedown", onGlobalMousedown);
        return () => document.removeEventListener("mousedown", onGlobalMousedown);
    }, [editingId]);


    return (
        <div className="resource-guide-sidebar-contents" >
            {includeTitle && (
                <div className="resource-guide-sidebar-title">
                    <i className="fa fa-brain"></i>
                    <span>{t('sidebar.title')}</span>
                </div>
            )}

            <div className="resource-guide-toc-container">
                <div>
                    <div>
                        <Link
                            to="/index?type=navigation"
                            className={`${styles.link} ${(location.pathname === "/index" && location.search === "?type=navigation") ? styles.linkActive : ""}`}
                        >
                            <i className={`fa fa-magnifying-glass ${styles.icon} ${(location.pathname === "/index" && location.search === "?type=navigation") ? styles.iconActive : ""}`} />
                            <span style={{ marginLeft: 4 }}>{t('sidebar.navigation')}</span>
                        </Link>

                    </div>


                    <div>
                        <Link
                            to="/index?type=formation"
                            className={`${styles.link} ${(location.pathname === "/index" && location.search === "?type=formation") ? styles.linkActive : ""}`}
                        >
                            <i className={`fa fa-graduation-cap ${styles.icon} ${(location.pathname === "/index" && location.search === "?type=formation") ? styles.iconActive : ""}`} />
                            <span style={{ marginLeft: 4 }}>{t('sidebar.formation')}</span>
                        </Link>
                    </div>

                </div>
                <br />
                <div className={styles.searchBox}>
                    <i className={`fa fa-magnifying-glass ${styles.searchIcon} ${styles.iconActive}`} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={`${t('sidebar.searchplaceholder')}...`}
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>


                <div className={styles.sectionTitle}>Chats</div>
                {((!ready && userId) || (syncing && convs.length == 0 && userId)) && (
                    <LoadingRoundComponent label="" />
                )}



                {userId && [...convs].reverse()
                    .filter(c => !c.deleted)
                    .filter(c => normalizeText(c.title || "").includes(normalizeText(filterText)))
                    .map((c) => {
                        const isActive = selectedId === c._id;
                        const rowCls = styles.itemRow;
                        const linkCls = `${styles.scrollLink} ${isActive ? styles.linkActive : ""}`;


                        return (
                            <div key={c._id} className={rowCls}>
                                <div className={styles.itemMain}>
                                    {editingId === c._id ? (
                                        <input
                                            ref={inputRef}
                                            className={styles.titleInput}
                                            value={draftTitle}
                                            onChange={(e) => setDraftTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    const trimmed = draftTitle.trim();
                                                    if (trimmed && trimmed !== c.title) {
                                                        const updated = { ...c, title: trimmed };
                                                        edit?.(updated, c);
                                                    }
                                                    setEditingId(null);
                                                }
                                                if (e.key === "Escape") {
                                                    setEditingId(null);
                                                    setDraftTitle("");
                                                }
                                            }}
                                            onBlur={() => {
                                                setEditingId(null);
                                                setDraftTitle("");
                                            }}
                                        />
                                    ) : (
                                        <Link to={`/index?id=${encodeURIComponent(c._id)}&type=${encodeURIComponent(c.type || 'navigation')}`}
                                            className={linkCls}
                                            title={c.title}
                                        >
                                            {c.title}
                                        </Link>
                                    )}

                                </div>

                                <button
                                    className={styles.moreBtn}
                                    aria-label="Options"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const btn = e.currentTarget;
                                        triggerRef.current = btn;
                                        const r = btn.getBoundingClientRect();
                                        const viewportHeight = window.innerHeight;
                                        const menuHeight = 90;
                                        const shouldOpenUpward = r.bottom + menuHeight > viewportHeight;

                                        const top = shouldOpenUpward
                                            ? Math.round(r.top - menuHeight - 4 + window.scrollY)
                                            : Math.round(r.bottom + 4 + window.scrollY);

                                        setMenuPos({
                                            top,
                                            left: Math.round(r.right - 160 + window.scrollX),
                                            width: Math.round(r.width),
                                        });
                                        setMenuOpenFor(prev => (prev === c._id ? null : c._id));
                                    }}
                                >
                                    <i className={`fa-solid fa-ellipsis ${styles.iconActive}`}></i>
                                </button>
                                {menuOpenFor === c._id && menuPos && createPortal(
                                    <div
                                        ref={menuRef}
                                        className={styles.menu}
                                        style={{ position: 'fixed', top: menuPos.top, left: menuPos.left }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            className={styles.menuItem}
                                            onClick={() => {
                                                setMenuOpenFor(null);
                                                setEditingId(c._id);
                                                setDraftTitle(c.title || "");
                                            }}
                                        >
                                            <i className="fa fa-pencil" aria-hidden="true"></i>
                                            {t('sidebar.renomer')}
                                        </button>
                                        <button
                                            className={styles.menuItem}
                                            onClick={() => {
                                                setMenuOpenFor(null);
                                                const ok = window.confirm(`${t('sidebar.deletemessage')} ${c.title}`);
                                                if (ok) del(c._id);
                                            }}
                                        >
                                            <i className="fa fa-trash" aria-hidden="true"></i>
                                            {t('sidebar.delete')}
                                        </button>
                                    </div>,
                                    document.body
                                )}

                            </div>


                        );
                    })}
            </div>
        </div>
    );
}

export default function SideBar() {
    const [flyoutOpen, setFlyoutOpen] = useState(false);

    useEffect(() => {
        if (!flyoutOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [flyoutOpen]);

    return (
        <RequireAuth>
            <div className="resource-guide-nav-sidebar">
                <SideBarContent includeTitle={true} />
            </div>

            <div className={styles.miniSidebar}>
                <button
                    className={styles.miniButton}
                    aria-label="Ouvrir le menu"
                    aria-expanded={flyoutOpen}
                    onClick={() => setFlyoutOpen(true)}
                >
                    <i className="fas fa-bars" ></i>
                </button>
            </div>

            {flyoutOpen && (
                <div
                    className={styles.flyoutOverlay}
                    role="presentation"
                    onClick={() => setFlyoutOpen(false)}
                >
                    <aside
                        className={styles.flyout}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu latéral"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.flyoutHeader}>
                            <div className="resource-guide-sidebar-title" style={{ margin: 0 }}>
                                <i className="fa fa-home"></i>
                                <span>Resource Center</span>
                            </div>
                            <button
                                className={styles.close}
                                aria-label="Fermer"
                                onClick={() => setFlyoutOpen(false)}
                            >
                                <i className="fa fa-times" aria-hidden="true"></i>
                            </button>
                        </div>

                        <div className={styles.flyoutBody}>
                            <SideBarContent includeTitle={false} />
                        </div>
                    </aside>
                </div>
            )}
        </RequireAuth>
    );
}
