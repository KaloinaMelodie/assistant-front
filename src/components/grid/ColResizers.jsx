import React from "react"

const ColResizers = ({
  colXs,
  colWidths,
  colResizing,
  colResizingDelta,
  scrollTop,
  onMouseDown,
  colHeaderHeight,
  height
}) => {
  return colXs.map((x, c) => {
    let left = x + colWidths[c] - 2
    if (colResizing === c && colResizingDelta != null) {
      left += colResizingDelta
    }

    return (
      <div
        key={`colresize:${c}`}
        style={{
          position: "absolute",
          top: scrollTop,
          left,
          height: colResizing === c ? height : colHeaderHeight,
          width: 4,
          backgroundColor: colResizing === c ? "#66afe9" : undefined,
          cursor: "col-resize"
        }}
        onMouseDown={(ev) => onMouseDown(c, ev)}
      />
    )
  })
}

export default ColResizers
