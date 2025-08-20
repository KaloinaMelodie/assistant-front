import React from "react"
import CrossComponent from "../element/CrossComponent"

/**
 * Props for VerticalTreeLayoutComponent
 */
export default function VerticalTreeLayoutComponent({ headElem, height, line, children }) {
  const renderChildren = () => {
    const childArray = React.Children.toArray(children)
    const len = childArray.length
    const result = []

    for (let i = 0; i < len * 2 + 1; i++) {
      const isCenter = i === len

      if (i === 0 || i === len * 2) {
        result.push(
          <CrossComponent key={i} collapseTop={true} height={height} />
        )
      } else if (i % 2 === 0) {
        result.push(
          <CrossComponent
            key={i}
            collapseTop={true}
            height={height}
            e={line}
            w={line}
            n={isCenter ? line : undefined}
          />
        )
      } else {
        const child = childArray[Math.floor(i / 2)]
        result.push(
          <div
            key={i}
            style={{
              display: "flex",
              flexFlow: "column nowrap",
              justifyContent: "flex-start",
              flexShrink: 0
            }}
          >
            <CrossComponent
              collapseTop={true}
              n={isCenter ? line : undefined}
              s={line}
              e={i < len * 2 - 1 ? line : undefined}
              w={i > 1 ? line : undefined}
              height={height}
            />
            {child}
          </div>
        )
      }
    }

    return result
  }

  return (
    <div style={{ display: "flex", flexFlow: "column nowrap", alignItems: "center" }}>
      {headElem}
      {React.Children.count(children) > 0 && (
        <CrossComponent collapseTop={true} height={height} s={line} />
      )}
      <div
        key="children"
        style={{
          display: "flex",
          flexFlow: "row nowrap",
          justifyContent: "flex-start",
          width: "100%"
        }}
      >
        {renderChildren()}
      </div>
    </div>
  )
}
