// components/gantt/YearScale.jsx
import React from "react"
import moment from "moment"

const YearScale = ({ startDate, endDate, dateToPx, height }) => {
  const segs = []
  const date = moment(startDate)
  while (date.isBefore(endDate)) {
    const itemStart = moment(date)
    date.add(1, "year")
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
            <line x1={left} y1={0} x2={left} y2={height} stroke="#DDD" strokeWidth={1} />
            <line x1={right} y1={0} x2={right} y2={height} stroke="#DDD" strokeWidth={1} />
            <text textAnchor="middle" x={(left + right) / 2} y={8} fill="#333" fontSize={9}>
              {seg[0].format("YYYY")}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default YearScale