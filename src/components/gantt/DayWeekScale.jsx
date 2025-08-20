// components/gantt/DayWeekScale.jsx
import React from "react"
import moment from "moment"

const DayWeekScale = ({ startDate, endDate, dateToPx, height, scale }) => {
  const segs = []
  const date = moment(startDate).startOf("week")
  if (scale < 1.6) return null
  while (date.isBefore(endDate)) {
    const itemStart = moment(date)
    date.add(1, scale > 15 ? "days" : "weeks")
    const itemEnd = moment(date)
    if (!itemEnd.isAfter(endDate) && !itemStart.isBefore(startDate)) {
      segs.push([itemStart, itemEnd])
    }
  }

  return (
    <g>
      {segs.map((seg, i) => {
        const left = dateToPx(seg[0])
        const right = dateToPx(seg[1])
        return (
          <g key={i}>
            <line x1={left} y1={22} x2={left} y2={height} stroke="#F6F6F6" strokeWidth={1} />
            <line x1={right} y1={22} x2={right} y2={height} stroke="#F6F6F6" strokeWidth={1} />
            <text textAnchor="middle" x={(left + right) / 2} y={31} fill="#AAA" fontSize={9}>
              {seg[0].format("DD")}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default DayWeekScale
