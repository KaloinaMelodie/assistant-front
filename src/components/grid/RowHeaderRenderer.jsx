import React from "react"

const RowHeaderRenderer = ({ row, top, scrollLeft, width, height, selected, renderRowHeader }) => {
  return (
    <div
      key={`h:${row}`}
      style={{
        position: "absolute",
        left: scrollLeft,
        top,
        width: width + 1,
        height: height + 1,
        border: "solid 1px #c0c0c0",
        backgroundColor: selected ? "#eaeaea" : "#f5f5f5"
      }}
    >
      {renderRowHeader({ row, width: width - 1, height: height - 1, selected })}
    </div>
  )
}

export default RowHeaderRenderer