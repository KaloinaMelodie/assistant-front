import React, { useEffect, useState, useRef, Children, cloneElement } from "react"

/**
 * Lays out divs vertically, allowing fractional allocation combined with auto-sized ones
 * Children must all have keys
 * Children will be cloned with height prop set in case of fractional ones
 */
export default function VerticalLayoutComponent({ height, relativeHeights, children }) {
  const [availableHeight, setAvailableHeight] = useState(0)
  const refs = useRef({})

  const recalculateSize = () => {
    let newAvailableHeight = height
    Children.forEach(children, (child) => {
      if (!child || relativeHeights[child.key]) return
      const node = refs.current[child.key]
      if (node) newAvailableHeight -= node.offsetHeight || 0
    })
    setAvailableHeight(newAvailableHeight)
  }

  useEffect(() => {
    recalculateSize()
  }, [height, children])

  return (
    <div style={{ height }}>
      {Children.map(children, (child) => {
        if (!child) return null

        if (child.key && relativeHeights[child.key]) {
          if (availableHeight) {
            const childHeight = availableHeight * relativeHeights[child.key]
            return (
              <div style={{ height: childHeight, position: "relative" }}>
                <div style={{ height: childHeight, overflowY: "auto" }}>
                  {cloneElement(child, {
                    height: childHeight,
                    ref: (el) => {
                      refs.current[child.key] = el
                      if (typeof child.ref === "function") child.ref(el)
                    }
                  })}
                </div>
              </div>
            )
          }
          return null
        }

        return cloneElement(child, {
          ref: (el) => {
            refs.current[child.key] = el
          }
        })
      })}
    </div>
  )
}
