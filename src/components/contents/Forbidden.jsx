import React from "react";
// import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function Forbidden({
  homeTo = "/",                        // route d’accueil
  title = " Accès refusé",
  subtitle = "Vous n’avez pas l’autorisation d’accéder à cette page.",
  help = "",
}) {
  // Optionnel i18n :
  // const { t } = useTranslation();
  // const title = t("errors.403.title", "403 — Accès refusé");
  // const subtitle = t("errors.403.subtitle", "Vous n’avez pas l’autorisation d’accéder à cette page.");
  // const help = t("errors.403.help", "Si vous pensez qu’il s’agit d’une erreur, contactez un administrateur.");

  const navigate = useNavigate();

  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif",
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(0,0,0,0.04), transparent 60%)",
      }}
    >
      <section
        className="shadow-sm rounded-4 text-center"
        style={{
          width: "min(92vw, 720px)",
          backgroundColor: "var(--td-light, #fff)",
          color: "var(--td-font-color, #000)",
          border: "1px solid rgba(0,0,0,.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 6,
            background:
              "linear-gradient(90deg, var(--bs-primary, #0d6efd) 0%, rgba(13,110,253,0.6) 50%, var(--bs-primary, #0d6efd) 100%)",
          }}
        />
        <div className="p-4 p-md-5">
          <div
            style={{
              fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
              letterSpacing: "-0.5px",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            Erreur
          </div>

          <h1 className="mt-2" style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.5rem)", fontWeight: 700 }}>
            {title}
          </h1>

          <p className="mt-3 mb-0" style={{ opacity: 0.9 }}>
            {subtitle}
          </p>
          <p className="text-body-secondary mt-1" style={{ opacity: 0.8 }}>
            {help}
          </p>

          <div className="d-flex gap-2 justify-content-center mt-4">
            {/* <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              Page précédente
            </button> */}
            <Link className="btn btn-primary" to={homeTo}>
              Revenir à l’accueil
            </Link>
          </div>

          {/* Lien d’assistance optionnel */}
          <div className="mt-4 small text-body-secondary" style={{ opacity: 0.8 }}>
            Code d’erreur&nbsp;: 403 • Accès restreint par la politique de sécurité
          </div>
        </div>
      </section>
    </main>
  );
}
