import React from "react"

const CellRenderer = ({
  row,
  col,
  left,
  top,
  width,
  height,
  selected,
  onMouseDown,
  onDoubleClick,
  renderCell
}) => {
  const style = {
    position: "absolute",
    left: left + 1,
    top: top + 1,
    width: width - 1,
    height: height - 1
  }

  return (
    <div
      key={`${col}:${row}`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      style={style}
    >
      {renderCell({ row, col, width: width - 1, height: height - 1, selected, onStartEdit: () => {} })}
    </div>
  )
}

export default CellRenderer