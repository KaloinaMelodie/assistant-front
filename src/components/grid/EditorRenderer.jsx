import React from "react"

const EditorRenderer = ({
  row,
  col,
  left,
  top,
  width,
  height,
  saving,
  renderCellEditor,
  setSaveEdit,
  onEndEdit
}) => {
  const style = {
    position: "absolute",
    left: left + 1,
    top: top + 1,
    width: width - 1,
    height: height - 1
  }

  return (
    <div style={style}>
      {renderCellEditor({
        row,
        col,
        width: width - 1,
        height: height - 1,
        saving,
        setSaveEdit,
        onEndEdit
      })}
    </div>
  )
}

export default EditorRenderer
