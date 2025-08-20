import React, { useState } from "react";

/**
 * @param {{ 
 *  tabs: Array<{ id: string, label: React.ReactNode, elem: React.ReactNode, onRemove?: () => void }>,
 *  initialTabId?: string,
 *  tabId?: string,
 *  onAddTab?: () => void,
 *  onTabClick?: (tabId: string) => void
 * }} props
 */
const TabbedComponent = ({ tabs, initialTabId, tabId: controlledTabId, onAddTab, onTabClick }) => {
  const [internalTabId, setInternalTabId] = useState(initialTabId);
  const tabId = controlledTabId ?? internalTabId;

  const handleClick = (id) => {
    if (onTabClick) {
      onTabClick(id);
    } else {
      setInternalTabId(id);
    }
  };

  const handleRemove = (e, tab) => {
    e.stopPropagation();
    tab.onRemove?.();
  };

  const currentTab = tabs.find((tab) => tab.id === tabId);

  return (
    <div>
      <ul className="nav nav-tabs" style={{ marginBottom: 10 }}>
        {tabs.map((tab) => (
          <li key={tab.id} className="nav-item">
            <a
              className={`nav-link ${tabId === tab.id ? "active" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(tab.id)}
            >
              {tab.label}
              {tab.onRemove && (
                <button
                  type="button"
                  className="btn btn-sm btn-link"
                  onClick={(e) => handleRemove(e, tab)}
                >
                  <span className="fa fa-times" />
                </button>
              )}
            </a>
          </li>
        ))}
        {onAddTab && (
          <li className="nav-item">
            <a className="nav-link" onClick={onAddTab} style={{ cursor: "pointer" }}>
              <i className="fa fa-plus" />
            </a>
          </li>
        )}
      </ul>
      <div>{currentTab?.elem}</div>
    </div>
  );
};

export default TabbedComponent;
