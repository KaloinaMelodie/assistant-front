import PropTypes from "prop-types"

const CrossComponent = ({
  n,
  e,
  s,
  w,
  width = "100%",
  height = "100%",
  collapseTop = false
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width,
        height
      }}
    >
      <div
        style={{
          display: "flex",
          flex: collapseTop ? "0 1 0px" : "1 1 0px"
        }}
      >
        <div
          style={{
            display: "flex",
            flex: "1 1 0px",
            borderRight: n,
            borderBottom: w
          }}
        />
        <div
          style={{
            display: "flex",
            flex: "1 1 0px",
            borderBottom: e
          }}
        />
      </div>
      <div style={{ display: "flex", flex: "1 1 0px" }}>
        <div
          style={{
            display: "flex",
            flex: "1 1 0px",
            borderRight: s
          }}
        />
        <div style={{ display: "flex", flex: "1 1 0px" }} />
      </div>
    </div>
  )
}

CrossComponent.propTypes = {
  n: PropTypes.string,
  e: PropTypes.string,
  s: PropTypes.string,
  w: PropTypes.string,
  width: PropTypes.any,
  height: PropTypes.any,
  collapseTop: PropTypes.bool
}

export default CrossComponent
