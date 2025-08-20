import React from "react"
import { defaultT } from "ez-localize"
import { GanttChart } from "../gantt/GanttChart"

export default function GanttChartDemo() {
  const rows = [
    { label: "Activity 1", level: 0, startDate: "2020-01-14", endDate: "2020-05-23", color: "#68cdee" },
    { label: "Activity 2", level: 1, startDate: "2020-02-14", endDate: "2020-06-23", color: "#68cdee" },
    { label: "Activity 3", level: 2, startDate: "2020-04-12", endDate: null,        color: "#68cdee" },
    { label: "Activity 1", level: 0, startDate: "2020-01-14", endDate: "2020-05-23", color: "#68cdee" },
    { label: "Activity 2", level: 1, startDate: "2020-02-14", endDate: "2020-06-23", color: "#68cdee" },
    { label: "Activity 3", level: 1, startDate: "2020-04-12", endDate: "2020-07-23", color: "#68cdee" }
  ]

  return (
    <div style={{ paddingTop: 20 }}>
      <GanttChart
        rows={rows}
        startDate="2020-01-01"
        endDate="2020-12-31"
        T={defaultT}
        onMoveRowDown={() => {}}
        onMoveRowUp={() => {}}
        onMoveRowLeft={() => {}}
        onMoveRowRight={() => {}}
        onRowClick={() => alert("Row clicked")}
        onAddRow={() => alert("Add row")}
        onInsertRowAbove={() => {}}
        onInsertRowBelow={() => {}}
        onInsertChildRow={() => {}}
        onRemoveRow={() => {}}
      />
    </div>
  )
}
