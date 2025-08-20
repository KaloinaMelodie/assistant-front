import React from "react"

const SelectionBox = ({ row, col, colXs, rowHeight, colHeaderHeight, colWidths }) => {
  const style = {
    position: "absolute",
    left: colXs[col],
    top: row * rowHeight + colHeaderHeight,
    width: colWidths[col] + 1,
    height: rowHeight + 1,
    border: "2px solid #66afe9",
    pointerEvents: "none"
  }
  return <div style={style} />
}

export default SelectionBox
