import React from "react"

const GridLines = ({ colXs, rowStart, rowEnd, colStart, colEnd, rowHeight, colHeaderHeight, colWidths }) => {
  const lines = []

  for (let r = rowStart; r <= rowEnd; r++) {
    const y = r * rowHeight + colHeaderHeight
    lines.push(
      <div
        key={`grid-row-${r}`}
        style={{
          position: "absolute",
          top: y,
          left: colXs[colStart],
          width: colXs[colEnd] + colWidths[colEnd] - colXs[colStart],
          height: rowHeight + 1,
          border: "solid 1px #EEE"
        }}
      />
    )
  }

  for (let c = colStart; c <= colEnd; c++) {
    const y = rowStart * rowHeight + colHeaderHeight
    lines.push(
      <div
        key={`grid-col-${c}`}
        style={{
          position: "absolute",
          top: y,
          left: colXs[c],
          height: rowHeight * (rowEnd - rowStart + 1),
          width: colWidths[c] + 1,
          border: "solid 1px #EEE"
        }}
      />
    )
  }

  return lines
}

export default GridLines
