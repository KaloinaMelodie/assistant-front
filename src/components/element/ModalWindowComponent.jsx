import React, { useEffect, useRef } from "react"
import ReactDOM from "react-dom"

export function showModal(modalFunc, onClose) {
  const tempDiv = document.createElement("div")

  const close = () => {
    ReactDOM.unmountComponentAtNode(tempDiv)
    tempDiv.remove()
    if (onClose) onClose()
  }

  const popupElem = modalFunc(close)
  return ReactDOM.render(popupElem, tempDiv)
}

export default function ModalWindowComponent({
  isOpen,
  onRequestClose,
  backgroundColor = "white",
  outerPadding = 40,
  innerPadding = 20,
  children
}) {
  const modalRef = useRef(document.createElement("div"))

  useEffect(() => {
    const node = modalRef.current
    const parent = document.fullscreenElement || document.body
    parent.appendChild(node)
    return () => node.remove()
  }, [])

  if (!isOpen) return null

  const overlayStyle = {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1055,
    backgroundColor: "rgba(0, 0, 0, 0.7)"
  }

  const windowStyle = {
    position: "fixed",
    left: outerPadding,
    right: outerPadding,
    top: outerPadding,
    bottom: outerPadding,
    zIndex: 1055,
    backgroundColor,
    borderRadius: 10,
    border: "solid 1px #AAA"
  }

  const contentStyle = {
    position: "absolute",
    left: innerPadding,
    right: innerPadding,
    top: innerPadding,
    bottom: innerPadding,
    overflowY: "auto"
  }

  const closeStyle = {
    position: "absolute",
    right: 8,
    top: 8,
    color: "#888",
    cursor: "pointer"
  }

  return ReactDOM.createPortal(
    <div className="modal-window-component">
      <style>{"body { overflow-y: hidden }"}</style>
      <div
        style={overlayStyle}
        onClick={onRequestClose}
        className="modal-window-component-overlay"
      />
      <div style={windowStyle} className="modal-window-component-window">
        <div style={contentStyle}>{children}</div>
        {onRequestClose && (
          <div style={closeStyle}>
            <button type="button" className="btn-close" onClick={onRequestClose} />
          </div>
        )}
      </div>
    </div>,
    modalRef.current
  )
}
