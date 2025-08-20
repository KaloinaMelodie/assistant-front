import { useRef, useEffect } from "react"
import { useDrag, useDrop } from "react-dnd"

const ITEM_TYPE = "form-item"

const ReorderableListItem = ({
  item,
  index,
  renderItem,
  onPutBefore,
  onPutAfter,
  onEndDrag,
  constrainTo,
  getItemId,
}) => {
  const ref = useRef(null)
  // const id = getItemId(item)
  const id = getItemId(item, index)


  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      const height = ref.current?.getBoundingClientRect().height || 0
      return { id, constrainTo, height }
    },
    end: () => {
      onEndDrag()
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    canDrop: (dragged) => dragged.constrainTo === constrainTo,
    hover: (dragged, monitor) => {
      if (!ref.current) return
      const draggedId = dragged.id
      if (draggedId === id) return

      const hoverRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset.y - hoverRect.top

      if (
        hoverClientY < hoverMiddleY &&
        hoverClientY < dragged.height
      ) {
        onPutBefore(id, draggedId)
      } else if (
        hoverClientY > hoverMiddleY &&
        hoverClientY > hoverRect.height - dragged.height
      ) {
        onPutAfter(id, draggedId)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  drag(drop(ref)) // Connect drag + drop

  return renderItem(item, index, drag, preview, drop, {
    isDragging,
    isOver,
    canDrop,
    ref,
  })
}

export default ReorderableListItem
