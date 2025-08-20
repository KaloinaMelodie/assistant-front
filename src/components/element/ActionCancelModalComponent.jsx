import ModalPopup from "./ModalPopupComponent"

const ActionCancelModal = ({
  title,
  actionLabel = "Save",
  cancelLabel,
  deleteLabel = "Delete",
  onAction,
  onCancel,
  onDelete,
  size,
  actionBusy = false,
  deleteBusy = false,
  children
}) => {
  const footer = (
    <>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="btn btn-danger me-auto"
        >
          {deleteBusy && <i className="fa fa-spinner fa-spin" />}{" "}
          {deleteLabel}
        </button>
      )}

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionBusy}
          className="btn btn-primary"
        >
          {actionBusy && <i className="fa fa-spinner fa-spin" />}{" "}
          {actionLabel}
        </button>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="btn btn-secondary"
      >
        {cancelLabel || (onAction ? "Cancel" : "Close")}
      </button>
    </>
  )

  return (
    <ModalPopup
      size={size}
      header={title}
      footer={footer}
      onClose={onCancel}
    >
      {children}
    </ModalPopup>
  )
}

export default ActionCancelModal
