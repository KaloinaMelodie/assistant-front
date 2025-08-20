import { useResizeDetector } from "react-resize-detector"

const AutoSize = ({ injectWidth, injectHeight, children }) => {
  const { width, height, ref } = useResizeDetector({
    handleWidth: injectWidth,
    handleHeight: injectHeight
  })

  const style = {
    ...(injectWidth && { width: "100%" }),
    ...(injectHeight && { height: "100%" })
  }

  if ((injectWidth && width == null) || (injectHeight && height == null)) {
    return <div style={style} ref={ref} />
  }

  const size = {
    ...(injectWidth && { width }),
    ...(injectHeight && { height })
  }

  return (
    <div style={style} ref={ref}>
      {typeof children === "function" ? children(size) : null}
    </div>
  )
}

export default AutoSize;
