import React from "react"

const LoadingWriteComponent = ({ width = "100%", height = "100%", label = "Réflexion en cours..." }) => {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        backgroundColor: "transparent"
      }}
    >
      <div className="thinking-loader">
        <div className="dot dot1" />
        <div className="dot dot2" />
        <div className="dot dot3" />
      </div>
      <div style={{ fontSize: 18, color: "#444", fontWeight: 500, fontStyle: "italic" }}>{label}</div>

      <style>{`
        .thinking-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: rgb(40.8, 97.6, 146.4);
          animation: thinking 1.4s infinite ease-in-out both;
        }

        .dot1 {
          animation-delay: 0s;
        }
        .dot2 {
          animation-delay: 0.2s;
        }
        .dot3 {
          animation-delay: 0.4s;
        }

        @keyframes thinking {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          40% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingWriteComponent
