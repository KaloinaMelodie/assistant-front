import React from "react";
// import { useTranslation } from "react-i18next";
import { Link, useNavigate,useLocation } from "react-router-dom";

export default function NotFound({
    homeTo = "/index",                        // route d’accueil
    title = "Page introuvable",
    help = "",
}) {

    const { pathname } = useLocation();
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
                        Désolé, l’URL <code className="nf-path">{pathname}</code> n’existe pas.
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
                            Retour à l’accueil
                        </Link>
                    </div>

                </div>
            </section>
        </main>
    );
}


// import { Link, useLocation } from "react-router-dom";

// export default function NotFound() {
//   const { pathname } = useLocation();

//   return (
//     <div className="nf-screen">
//       <section className="nf-card" role="region" aria-labelledby="nf-title">
//         <span className="nf-chip">Erreur</span>
//         <h1 id="nf-title" className="nf-hero">Page introuvable</h1>
//         <p className="nf-lead">
//           Désolé, l’URL <code className="nf-path">{pathname}</code> n’existe pas.
//         </p>

//         <div className="nf-actions">
//           <Link to="/index" replace className="btn btn-primary nf-btn">
//             Retour à l’accueil
//           </Link>
//           {/* <Link to="/login" className="btn btn-outline-secondary nf-btn">
//             Se connecter
//           </Link> */}
//         </div>

//         {/* <p className="nf-hint">Besoin d’aide ? Actualise la page ou contacte l’administrateur.</p> */}
//       </section>
//     </div>
//   );
// }
