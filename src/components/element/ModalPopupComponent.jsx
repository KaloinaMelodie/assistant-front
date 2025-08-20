import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import _ from "lodash"

// Fonction utilitaire pour ouvrir un modal dynamiquement
export function showModal(modalFunc, onClose) {
  const container = document.createElement("div")

  const close = () => {
    ReactDOM.unmountComponentAtNode(container)
    container.remove()
    if (onClose) onClose()
  }

  const element = modalFunc(close)
  return ReactDOM.render(element, container)
}

const InnerModal = ({
  header,
  footer,
  size = "normal",
  showCloseX = false,
  onClose,
  width,
  children
}) => {
  const dialogClass = [
    "modal-dialog",
    size === "large" ? "modal-lg" : "",
    size === "small" ? "modal-sm" : "",
    size === "x-large" ? "modal-xl" : ""
  ].join(" ")

  const dialogStyle = width
    ? { width }
    : size === "full"
    ? { maxWidth: "95%" }
    : undefined

  const rootStyle = {
    display: "block"
  }

  const overlayStyle = {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)"
  }

  return (
    <div style={rootStyle} className="modal show">
      <style>{"body { overflow-y: hidden }"}</style>
      <div style={overlayStyle} onClick={onClose} />
      <div className={dialogClass} style={dialogStyle}>
        <div className="modal-content">
          {header && (
            <div className="modal-header">
              <h5 className="modal-title">{header}</h5>
              {showCloseX && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                />
              )}
            </div>
          )}

          <div
            className="modal-body"
            style={{
              maxHeight:
                window.innerHeight -
                (header ? 56 : 0) -
                (footer ? 65 : 0) -
                60,
              overflowY: "auto"
            }}
          >
            {children}
          </div>

          {footer && <div className="modal-footer">{footer}</div>}

          {!header && showCloseX && (
            <button
              className="btn-close"
              onClick={onClose}
              style={{ position: "absolute", right: 10, top: 10 }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const ModalPopup = ({
  header,
  footer,
  size,
  showCloseX,
  onClose,
  width,
  children
}) => {
  const modalNode = useRef(document.createElement("div"))

  useEffect(() => {
    const node = modalNode.current

    const target = document.fullscreenElement || document.body
    target.appendChild(node)

    return () => {
      node.remove()
    }
  }, [])

  return createPortal(
    <InnerModal
      header={header}
      footer={footer}
      size={size}
      showCloseX={showCloseX}
      onClose={onClose}
      width={width}
    >
      {children}
    </InnerModal>,
    modalNode.current
  )
}

export default ModalPopup
