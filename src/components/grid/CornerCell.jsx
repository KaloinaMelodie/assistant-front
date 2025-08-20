import React from "react"

const CornerCell = ({ scrollLeft, scrollTop, width, height, renderTopLeft }) => {
  const style = {
    position: "absolute",
    left: scrollLeft,
    top: scrollTop,
    width: width + 1,
    height: height + 1,
    border: "solid 1px #c0c0c0",
    backgroundColor: "#f5f5f5"
  }

  return <div key="h:h" style={style}>{renderTopLeft?.()}</div>
}

export default CornerCell;