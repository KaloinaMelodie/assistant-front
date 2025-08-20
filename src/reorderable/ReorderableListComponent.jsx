import React,{ useState, useEffect, useCallback } from "react"
import _ from "lodash"
import { v4 as uuidv4 } from "uuid" // ou utilise crypto.randomUUID() si moderne
import ReorderableListItem from "./ReorderableListItemComponent"

const ReorderableList = ({
  items,
  onReorder,
  renderItem,
  getItemId = (_, index) => index,
  listId = uuidv4(),
  element = <div />
}) => {
  const [order, setOrder] = useState(null)

  // Reset order if items change
  useEffect(() => {
    setOrder(null)
  }, [items])

  // const fixOrder = useCallback((list, order) => {
  //   if (!order) return list
  //   return order.map(i => list[i])
  // }, [])
  const fixOrder = useCallback((list, order) => {
  if (!order) return list
  const itemMap = new Map(list.map((item, i) => [getItemId(item, i), item]))
  return order.map(id => itemMap.get(id)).filter(Boolean)
}, [getItemId])


  const handlePutBefore = useCallback((id, beforeId) => {
    // let currentOrder = items.map((_, index) => index)
    let currentOrder = items.map((item, index) => getItemId(item, index))
    // currentOrder = _.without(currentOrder, beforeId)
      currentOrder = _.without(currentOrder, id)
    // const index = currentOrder.indexOf(id)
    // currentOrder.splice(index, 0, beforeId)
      const index = currentOrder.indexOf(beforeId)
    currentOrder.splice(index, 0, id)

    if (!_.isEqual(currentOrder, order)) {
      setOrder(currentOrder)
    }
  }, [items, order, getItemId])

  const handlePutAfter = useCallback((id, afterId) => {
    // let currentOrder = items.map((_, index) => index)
    let currentOrder = items.map((item, index) => getItemId(item, index))
    // currentOrder = _.without(currentOrder, afterId)
    currentOrder = _.without(currentOrder, id)
    // const index = currentOrder.indexOf(id)
      const index = currentOrder.indexOf(afterId)
    // currentOrder.splice(index + 1, 0, afterId)
    currentOrder.splice(index + 1, 0, id)

    if (!_.isEqual(currentOrder, order)) {
      setOrder(currentOrder)
    }
  }, [items, order, getItemId])

  const handleEndDrag = useCallback(() => {
    if (!order) return
    const newOrder = fixOrder([...items], order)
    // setOrder(null)
    onReorder(newOrder)
    
  }, [order, items, onReorder, fixOrder])
  
  const reorderedItems = fixOrder([...items], order)

  useEffect(() => {
  if (order !== null) {
    setOrder(null) 
  }
}, [items])

  const children = reorderedItems.map((item, index) => {
    return (
      <ReorderableListItem
      key={getItemId(item, index)}
      item={item}
      index={index}
      renderItem={renderItem}
      constrainTo={listId}
      // getItemId={() => index}
      getItemId={getItemId}
      onPutAfter={handlePutAfter}
      onPutBefore={handlePutBefore}
      onEndDrag={handleEndDrag}
      />
    );
  }
  )

  return (
    <>
      {React.cloneElement(element, {}, children)}
    </>
  )
}

export default ReorderableList
