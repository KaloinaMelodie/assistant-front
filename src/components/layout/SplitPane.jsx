import React, { useState, useRef, useEffect, useCallback } from "react"
import Pane from "./Pane"
import Divider from "./Divider"

const SplitPane = ({
  split = "vertical",
  firstPaneSize = 200,
  minFirstPaneSize = 100,
  minSecondPaneSize = 100,
  onResize,
  children
}) => {
  const [currentSize, setCurrentSize] = useState(firstPaneSize)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef(null)
  const startPosition = useRef(0)

  const handleMouseDown = (e) => {
    startPosition.current = split === "vertical" ? e.clientX : e.clientY
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const maxSize =
        (split === "vertical" ? containerRect.width : containerRect.height) -
        minSecondPaneSize

      const current = split === "vertical" ? e.clientX : e.clientY
      const delta = current - startPosition.current
      let newSize = currentSize + delta

      // Clamp size between min and max
      newSize = Math.max(minFirstPaneSize, Math.min(newSize, maxSize))

      setCurrentSize(newSize)
      if (onResize) onResize(newSize)
      startPosition.current = current
    },
    [isResizing, split, currentSize, minFirstPaneSize, minSecondPaneSize, onResize]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const containerStyle = {
    display: "flex",
    height: "100%",
    width: "100%",
    flexDirection: split === "vertical" ? "row" : "column",
    position: "relative",
    overflow: "hidden"
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <Pane split={split} width={currentSize}>
        {children[0]}
      </Pane>
      <Divider split={split} onMouseDown={handleMouseDown} />
      <Pane split={split}>
        {children[1]}
      </Pane>
    </div>
  )
}

export default SplitPane
