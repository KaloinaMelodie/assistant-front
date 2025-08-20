import React from "react"

const LoadingComponent = ({ width = "100%", height = "100%", label = "Chargement..." }) => {
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
        backgroundColor: "transparent"
      }}
    >
      <div className="loader-pulse" />
      <div style={{ fontSize: 16, color: "#555", fontStyle: "italic" }}>{label}</div>

      <style>{`
        .loader-pulse {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgb(40.8, 97.6, 146.4);
          animation: pulse 1.2s infinite ease-in-out;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default LoadingComponent
