import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './SideBar.module.css';

function SideBarContent({ includeTitle = true }) {
    return (
        <div className="resource-guide-sidebar-contents" >
            {includeTitle && (
                <div className="resource-guide-sidebar-title">
                    <i className="fa fa-home"></i>
                    <span>Resource Center</span>
                </div>
            )}

            <div className="resource-guide-toc-container">
                <div>
                    <div>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.linkActive}` : styles.link
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <i
                                        className={`fa fa-star ${styles.icon} ${isActive ? styles.iconActive : ''
                                            }`}
                                    />
                                    <span style={{ marginLeft: 4 }}>Getting started</span>
                                </>
                            )}
                        </NavLink>
                    </div>

                    <div>
                        <NavLink
                            to="/1"
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.linkActive}` : styles.link
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <i
                                        className={`fa fa-info-circle ${styles.icon} ${isActive ? styles.iconActive : ''
                                            }`}
                                    />
                                    <span style={{ marginLeft: 4 }}>How to create an account</span>
                                </>
                            )}
                        </NavLink>
                    </div>
                </div>
            </div>

            {/* Titre de section collant (ne change pas le style, uniquement le comportement) */}
            <div className={styles.sectionTitle}>Chat</div>

            <a href="#" className={styles.scrollLink}>
                Ceci est un lien avec un titre très très très très très long qui doit être tronqué par des points de suspension
                si ça dépasse la largeur
            </a>
            <a href="#" className={styles.scrollLink}>
                Un autre lien avec un titre encore plus long qui ne doit pas casser la mise en page mais afficher ...
            </a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
            <a href="#" className={styles.scrollLink}>Lien court</a>
        </div>
    );
}

export default function SideBar() {
    const [flyoutOpen, setFlyoutOpen] = useState(false);

    // Bloque le scroll du body quand le flyout est ouvert (mobile)
    useEffect(() => {
        if (!flyoutOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [flyoutOpen]);

    return (
        <>
            {/* Sidebar desktop (≥ 769px). Le scroll est géré PAR .resource-guide-sidebar-contents */}
            <div className="resource-guide-nav-sidebar">
                <SideBarContent includeTitle={true} />
            </div>

            {/* Mini-rail + bouton (affiché uniquement < 769px via CSS) */}
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

            {/* Flyout mobile (< 769px) */}
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
        </>
    );
}
