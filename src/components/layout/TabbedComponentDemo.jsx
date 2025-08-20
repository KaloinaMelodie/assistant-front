import React, { useState } from "react"
import TabbedComponent from "./TabbedComponent"

const TabbedComponentDemo = () => {
  const [tabs, setTabs] = useState([
    {
      id: "home",
      label: "Accueil",
      elem: <div>Bienvenue dans l'onglet Accueil</div>
    },
    {
      id: "profil",
      label: "Profil",
      elem: <div>Voici votre profil utilisateur</div>
    }
  ])

  const [activeTabId, setActiveTabId] = useState("home")

  const handleAddTab = () => {
    const id = `tab-${tabs.length + 1}`
    setTabs([
      ...tabs,
      {
        id,
        label: `Onglet ${tabs.length + 1}`,
        elem: <div>Contenu de l’onglet {tabs.length + 1}</div>,
        onRemove: () => handleRemoveTab(id)
      }
    ])
    setActiveTabId(id)
  }

  const handleRemoveTab = (id) => {
    const newTabs = tabs.filter((tab) => tab.id !== id)
    setTabs(newTabs)
    if (activeTabId === id && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <TabbedComponent
        tabs={tabs.map((tab) => ({
          ...tab,
          onRemove: tab.onRemove ?? (() => handleRemoveTab(tab.id))
        }))}
        tabId={activeTabId}
        onTabClick={setActiveTabId}
        onAddTab={handleAddTab}
      />
    </div>
  )
}

export default TabbedComponentDemo
