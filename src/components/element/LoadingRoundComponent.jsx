import React from "react";

const LoadingRoundComponent = ({ width = "100%", height = "100%", label = "Chargement..." }) => {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        backgroundColor: "transparent",
        position: "relative"
      }}
    >
      <div className="circle-spinner">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`dot dot-${i}`} />
        ))}
      </div>

      <div style={{ fontSize: 16, color: "#555", fontStyle: "italic" }}>{label}</div>

      <style>{`
        .circle-spinner {
          position: relative;
          width: 30px;
          height: 30px;
          animation: spin 1.2s linear infinite;
        }

        .dot {
          position: absolute;
          width: 5px;
          height: 5px;
          background: rgb(40.8, 97.6, 146.4);
          border-radius: 50%;
        }

        .dot-0 { top: 0%;   left: 50%; transform: translate(-50%, -50%); }
        .dot-1 { top: 15%;  left: 85%; transform: translate(-50%, -50%); }
        .dot-2 { top: 50%;  left: 100%; transform: translate(-50%, -50%); }
        .dot-3 { top: 85%;  left: 85%; transform: translate(-50%, -50%); }
        .dot-4 { top: 100%; left: 50%; transform: translate(-50%, -50%); }
        .dot-5 { top: 85%;  left: 15%; transform: translate(-50%, -50%); }
        .dot-6 { top: 50%;  left: 0%;  transform: translate(-50%, -50%); }
        .dot-7 { top: 15%;  left: 15%; transform: translate(-50%, -50%); }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingRoundComponent;
