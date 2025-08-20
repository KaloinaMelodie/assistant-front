import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const TopBar = () => {
  const { t, i18n } = useTranslation("topbar");
  const current = i18n.resolvedLanguage || i18n.language || "en";
  const items = [
    { lng: "en", label: "English" },
    { lng: "mg", label: "Malagasy" },
    { lng: "fr", label: "Français" },
  ];

  const onPick = (lng) => (e) => {
    e.preventDefault();
    i18n.changeLanguage(lng);
  };

  const activeLabel = items.find((x) => x.lng === current)?.label ?? "English";

  return (
    <div >
      <div style={{ width: '100%', height: '100%' }}>
        <nav className="navbar navbar-expand-lg bg-dark fixed-top" data-bs-theme="dark">
          <div className="container-fluid">
            <a className="navbar-brand">{t("title")}</a>
            <button
              className="navbar-toggler collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbar"
              aria-controls="navbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="navbar-collapse collapse" id="navbar">
              <ul className="nav navbar-nav me-auto ms-2">
                <li className="nav-item me-3">
                  <a className="nav-link active">Home</a>
                </li>
                <li className="nav-item me-3 dropdown">
                  <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Documentation</a>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item">Guides</a></li>
                    <li><a className="dropdown-item">Courses</a></li>
                  </ul>
                </li>
              </ul>
              <ul className="nav navbar-nav">
                <li className="nav-item me-2 dropdown">
                  <a
                    href="#"
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                    role="button"
                    aria-expanded="false"
                  >
                    <i className="fa fa-globe"></i> {activeLabel}
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end">
                    {items.map(({ lng, label }) => {
                      const isActive = lng === current;
                      return (
                        <li key={lng}>
                          <a
                            href="#"
                            className={`dropdown-item ${isActive ? "active" : ""}`}
                            aria-current={isActive ? "true" : undefined}
                            onClick={onPick(lng)}
                          >
                            {/* fa-fw = largeur fixe, le check n’avance pas le texte */}
                            <i className={`fas fa-fw me-1 ${isActive ? "fa-check" : ""}`}></i>
                            {label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              </ul>
              <ul className="nav navbar-nav">
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                    <span className="fas fa-user"></span> Kaloina Ravoahangilalao
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item">
                        <i className="fas fa-sign-out-alt"></i> {t("logout")}
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item">
                        <i className="fas fa-bug"></i> Report a Problem
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item">
                        <i className="fas fa-tools"></i> Admin
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default TopBar;
