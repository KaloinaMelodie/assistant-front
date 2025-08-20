import { ReactNode, useState } from "react"
import ActionCancelModal from "./ActionCancelModalComponent"
import ReorderableListComponent from "../../reorderable/ReorderableListComponent"

/**
 * Generic editor for a list of items that shows the items within a Bootstrap 3 list-group.
 * Adding and editing are done via a popup if present
 */
export default function ListEditorComponent({
  items,
  onItemsChange,
  renderItem,
  renderEditor,
  createNew,
  validateItem,
  addLabel,
  deleteConfirmPrompt,
  getReorderableKey,
  editLink,
  selectedIndex
}) {
  const [adding, setAdding] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)

  const handleAdd = (ev) => {
    ev.stopPropagation()
    if (renderEditor) {
      setAdding(createNew())
    } else {
      onItemsChange([...items, createNew()])
    }
  }

  const handleDelete = (index, ev) => {
    ev.stopPropagation()
    ev.preventDefault()

    if (deleteConfirmPrompt) {
      const prompt = typeof deleteConfirmPrompt === "string" ? deleteConfirmPrompt : deleteConfirmPrompt(items[index])
      if (!confirm(prompt)) return
    }

    const newItems = items.slice()
    newItems.splice(index, 1)
    onItemsChange(newItems)
  }

  const renderListItem = (item, index) => {
    const handleChange = (updatedItem) => {
      const updatedItems = [...items]
      updatedItems[index] = updatedItem
      onItemsChange(updatedItems)
    }

    const handleClick = () => {
      if (renderEditor) {
        setEditing(item)
        setEditingIndex(index)
      }
    }

    return (
      <li
        key={index}
        className={`list-group-item${selectedIndex === index ? " active" : ""}`}
        onClick={editLink ? undefined : handleClick}
      >
        <a
          onClick={(e) => handleDelete(index, e)}
          style={{ float: "right", cursor: "pointer", color: selectedIndex === index ? "var(--bs-list-group-active-color)" : "var(--bs-primary)" }}
        >
          <i className="fa fa-remove" />
        </a>
        {editLink && renderEditor ? (
          <a
            onClick={handleClick}
            style={{ float: "right", cursor: "pointer", marginRight: 5, color: selectedIndex === index ? "var(--bs-list-group-active-color)" : "var(--bs-primary)" }}
          >
            <i className="fa fa-pencil" />
          </a>
        ) : null}
        {renderItem(item, index, handleChange)}
      </li>
    )
  }

  const renderDraggableListItem = (item, index, connectDragSource, connectDragPreview, connectDropTarget) => {
    let node = renderListItem(item, index)
    node = connectDragSource(connectDragPreview(connectDropTarget(node)))
    return node
  }

  return (
    <div>
      {adding && renderEditor && (
        <ActionCancelModal
          size="large"
          actionLabel="Add"
          onCancel={() => setAdding(null)}
          onAction={() => {
            if (validateItem && !validateItem(adding)) return
            onItemsChange([...items, adding])
            setAdding(null)
          }}
        >
          {renderEditor(adding, setAdding)}
        </ActionCancelModal>
      )}

      {editing && renderEditor && (
        <ActionCancelModal
          size="large"
          onCancel={() => setEditing(null)}
          onAction={() => {
            if (validateItem && !validateItem(editing)) return
            const updatedItems = [...items]
            updatedItems.splice(editingIndex, 1, editing)
            onItemsChange(updatedItems)
            setEditing(null)
          }}
        >
          {renderEditor(editing, setEditing)}
        </ActionCancelModal>
      )}

      {getReorderableKey ? (
        <ReorderableListComponent
          items={items}
          getItemId={getReorderableKey}
          onReorder={onItemsChange}
          renderItem={renderDraggableListItem}
          element={<ul className="list-group" />}
        />
      ) : (
        <ul className="list-group">{items.map(renderListItem)}</ul>
      )}

      {createNew && (
        <div>
          <button type="button" className="btn btn-link" onClick={handleAdd}>
            <i className="fa fa-plus" /> {addLabel || "Add"}
          </button>
        </div>
      )}
    </div>
  )
}
