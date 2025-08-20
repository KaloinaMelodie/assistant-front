// components/gantt/MonthScale.jsx
import React from "react"
import moment from "moment"

const MonthScale = ({ startDate, endDate, dateToPx, height }) => {
  const segs = []
  const date = moment(startDate)
  while (date.isBefore(endDate)) {
    const itemStart = moment(date)
    date.add(1, "month")
    const itemEnd = moment(date)
    segs.push([itemStart, itemEnd.isAfter(endDate) ? endDate : itemEnd])
  }

  return (
    <g>
      {segs.map((seg, i) => {
        const left = dateToPx(seg[0])
        const right = dateToPx(seg[1])
        return (
          <g key={i}>
            <line x1={left} y1={11} x2={left} y2={height} stroke="#DDD" strokeWidth={1} />
            <line x1={right} y1={11} x2={right} y2={height} stroke="#DDD" strokeWidth={1} />
            <text textAnchor="middle" x={(left + right) / 2} y={21} fill="#666" fontSize={9}>
              {seg[0].format("MMM")}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default MonthScale
