import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

//  TODO mettre dans locales topbar les textes
const TopBar = () => {
  const { t, i18n } = useTranslation('topbar');
  const { user, logout } = useAuth();
  const role = user?.is_admin ? 'admin' : (user ? 'user' : 'guest');

  const current = i18n.resolvedLanguage || i18n.language || 'fr';
  const items = [
    { lng: 'en', label: 'English' },
    { lng: 'mg', label: 'Malagasy' },
    { lng: 'fr', label: 'Français' },
  ];
  const onPick = (lng) => (e) => { e.preventDefault(); i18n.changeLanguage(lng); };
  const activeLabel = items.find((x) => x.lng === current)?.label ?? 'Français';

  const menu = [
    { text: t('home'), to: '/index', roles: ['admin', 'user'] },

    {
      text: t('admin') ,
      roles: ['admin'],
      children: [
        { text: t('translation') , to: '/traduction', roles: ['admin'] },
        { text: t('administrators'), to: '/admins', roles: ['admin'] },
        { text: t('workflow_logs'), to: '/logs', roles: ['admin'] }
      ]
    },

    { text: t('dashboard'), to: '/console', roles: ['admin'] },

  ];

  return (
    <nav className="navbar navbar-expand-lg bg-dark fixed-top" data-bs-theme="dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/index">{t('title')}</Link>

        <button className="navbar-toggler collapsed" type="button"
          data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar"
          aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="navbar-collapse collapse" id="navbar">

          <ul className="nav navbar-nav me-auto ms-2">
            {menu.map(item => {
              // Filtre par role pour parent
              if (!item.roles?.includes(role)) return null;
              if (Array.isArray(item.children)) {
                const children = item.children.filter(c => c.roles?.includes(role));
                if (!children.length) return null;

                return (
                  <li className="nav-item me-3 dropdown" key={item.text}>
                    <a
                      href="#"
                      className="nav-link dropdown-toggle"
                      data-bs-toggle="dropdown"
                      role="button"
                      aria-expanded="false"
                    >
                      {item.text}
                    </a>
                    <ul className="dropdown-menu">
                      {children.map(child => (
                        <li key={child.to}>
                          <Link className="dropdown-item" to={child.to}>
                            {child.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }
              return (
                <li className="nav-item me-3" key={item.to}>
                  <Link className="nav-link" to={item.to}>
                    {item.text}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/*  langue + user */}
          <ul className="nav navbar-nav">
            <li className="nav-item me-2 dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" role="button" aria-expanded="false">
                <i className="fa fa-globe"></i> {activeLabel}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                {items.map(({ lng, label }) => {
                  const isActive = lng === current;
                  return (
                    <li key={lng}>
                      <a href="#"
                        className={`dropdown-item ${isActive ? 'active' : ''}`}
                        aria-current={isActive ? 'true' : undefined}
                        onClick={onPick(lng)}>
                        <i className={`fas fa-fw me-1 ${isActive ? 'fa-check' : ''}`}></i>{label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </li>

            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                <span className="fas fa-user"></span> {user?.name || t('not_logged') || 'Non connecté'}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                {!user && (
                  <li><Link className="dropdown-item" to="/login">{t('login') || 'Se connecter'}</Link></li>
                )}
                {user && (
                  <>
                    <li><a className="dropdown-item" onClick={logout}><i className="fas fa-sign-out-alt"></i> {t('logout')}</a></li>
                    {/* {user.is_admin && (
                      <li><Link className="dropdown-item" to="/admin"><i className="fas fa-tools"></i> Admin</Link></li>
                    )} */}
                  </>
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
