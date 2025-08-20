import PropTypes from "prop-types"
import React from "react"

const Divider = ({ split = "vertical", onMouseDown }) => {
  const isHorizontal = split === "horizontal"

  const style = {
    backgroundColor: "#aeaeae",
    ...(isHorizontal
      ? { height: 4, cursor: "row-resize" }
      : { width: 4, cursor: "col-resize" })
  }

  const className = `divider ${isHorizontal ? "horizontal" : "vertical"}`

  return <div className={className} style={style} onMouseDown={onMouseDown} />
}

Divider.propTypes = {
  split: PropTypes.oneOf(["vertical", "horizontal"]),
  onMouseDown: PropTypes.func.isRequired
}

export default Divider
