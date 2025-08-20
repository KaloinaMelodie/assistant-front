// components/gantt/GanttBarArea.jsx
import React, { useCallback, useRef, useState, useLayoutEffect } from "react"
import moment from "moment"
import MonthScale from "./MonthScale"
import YearScale from "./YearScale"
import DayWeekScale from "./DayWeekScale"

const headerHeight = 40
const rowHeight = 21
const scrollBarHeight = 20

const GanttBarArea = ({ rows, startDate, endDate, width, height, onRowClick }) => {
  const containerRef = useRef(null)
  const scrollLeftBy = useRef(0)

  const start = moment(startDate, "YYYY-MM-DD").startOf("month")
  const end = moment(endDate, "YYYY-MM-DD").endOf("month")
  const totalDays = end.diff(start, "days")
  const initialScale = width / totalDays
  const [scale, setScale] = useState(initialScale)

  const dateToPx = useCallback(
    (date) => Math.floor(date.diff(start, "days") * scale) + 0.5,
    [scale, startDate]
  )

  const handleWheel = (ev) => {
    if (!containerRef.current) return

    let newScale = scale
    if (ev.deltaY > 0) newScale = Math.max(initialScale, scale / 1.1)
    else if (ev.deltaY < 0) newScale = scale * 1.1
    else return

    setScale(newScale)

    const x = ev.clientX - containerRef.current.getBoundingClientRect().left + containerRef.current.scrollLeft
    const diffX = (x / scale) * newScale - x
    scrollLeftBy.current = diffX
  }

  useLayoutEffect(() => {
    if (scrollLeftBy.current !== 0 && containerRef.current) {
      containerRef.current.scrollBy({ left: scrollLeftBy.current })
      scrollLeftBy.current = 0
    }
  })

  const renderBar = (row, index) => {
    if (row.startDate && row.endDate && row.startDate !== row.endDate) {
      const startD = moment(row.startDate, "YYYY-MM-DD")
      const endD = moment(row.endDate, "YYYY-MM-DD")
      return (
        <rect
          key={index}
          x={dateToPx(startD)}
          y={headerHeight + 5 + rowHeight * index}
          width={dateToPx(endD) - dateToPx(startD)}
          height={11}
          rx={4}
          fill={row.color}
        />
      )
    } else if (row.startDate || row.endDate) {
      const date = moment(row.startDate || row.endDate, "YYYY-MM-DD")
      const x = dateToPx(date)
      const y = headerHeight + rowHeight * index + rowHeight / 2
      const size = 7
      return (
        <polygon
          key={index}
          points={[x - size, y, x, y - size, x + size, y, x, y + size].join(" ")}
          fill={row.color}
        />
      )
    }
    return null
  }

  const todayPx = dateToPx(moment())

  return (
    <div style={{ overflowX: "auto", position: "relative", height: "100%" }} ref={containerRef} onWheel={handleWheel}>
      <svg width={totalDays * scale} height={height - scrollBarHeight}>
        <DayWeekScale dateToPx={dateToPx} startDate={start} endDate={end} height={height} scale={scale} />
        <MonthScale dateToPx={dateToPx} startDate={start} endDate={end} height={height} />
        <YearScale dateToPx={dateToPx} startDate={start} endDate={end} height={height} />
        <line x1={todayPx} y1={32} x2={todayPx} y2={height} stroke="#3CF" />
        {rows.map(renderBar)}
      </svg>
    </div>
  )
}

export default GanttBarArea
