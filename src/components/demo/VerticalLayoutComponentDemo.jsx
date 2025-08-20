import React from "react"
import VerticalLayoutComponent from "../layout/VerticalLayoutComponent"

const VerticalLayoutComponentDemo = () => {
  return (
    <VerticalLayoutComponent
      height={600}
      relativeHeights={{
        variable1: 0.6,
        variable2: 0.4
      }}
    >
      {/* Élément à hauteur automatique (non listé dans relativeHeights) */}
      <div key="fixed1" style={{ backgroundColor: "#ccc", padding: 10 }}>
        🔒 Hauteur fixe basée sur le contenu (barre de navigation)
      </div>

      {/* Élément à hauteur variable : 60% de l'espace restant */}
      <div key="variable1" style={{ backgroundColor: "#b3d4fc", padding: 10 }}>
        📘 Contenu principal (60% de l'espace restant)
      </div>

      {/* Élément à hauteur fixe (ex : footer court) */}
      <div key="fixed2" style={{ backgroundColor: "#e0e0e0", padding: 5 }}>
        🔒 Footer statique
      </div>

      {/* Élément à hauteur variable : 40% de l'espace restant */}
      <div key="variable2" style={{ backgroundColor: "#c3fcb3", padding: 10 }}>
        📗 Section secondaire (40% de l'espace restant)
      </div>
    </VerticalLayoutComponent>
  )
}

export default VerticalLayoutComponentDemo
