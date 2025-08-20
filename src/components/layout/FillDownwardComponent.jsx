import { useRef, useEffect, useState } from "react"
import PropTypes from "prop-types"

const FillDownwardComponent = ({ margin = 0, children }) => {
  const ref = useRef(null)
  const [height, setHeight] = useState(0)

  const updateSize = () => {
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top
      const remaining = window.innerHeight - top - margin
      setHeight(Math.max(remaining, 0))
    }
  }

  useEffect(() => {
    updateSize()
    window.addEventListener("resize", updateSize)
    window.addEventListener("scroll", updateSize)
    return () => {
      window.removeEventListener("resize", updateSize)
      window.removeEventListener("scroll", updateSize)
    }
  }, [])

  useEffect(() => {
    // Force update on initial render after layout
    setTimeout(updateSize, 0)
  }, [margin])

  return (
    <div ref={ref} style={{ height: `${height}px`, position: "relative", overflow: "auto" }}>
      {children}
    </div>
  )
}

FillDownwardComponent.propTypes = {
  margin: PropTypes.number,
  children: PropTypes.node
}

export default FillDownwardComponent
