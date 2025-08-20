import React from "react"

const ColHeaderRenderer = ({ col, left, scrollTop, colWidth, height, selected, renderColHeader }) => {
  return (
    <div
      key={`${col}:h`}
      style={{
        position: "absolute",
        left,
        top: scrollTop,
        width: colWidth + 1,
        height: height + 1,
        border: "solid 1px #c0c0c0",
        backgroundColor: selected ? "#eaeaea" : "#f5f5f5"
      }}
    >
      {renderColHeader({ col, width: colWidth - 1, height: height - 1, selected })}
    </div>
  )
}

export default ColHeaderRenderer