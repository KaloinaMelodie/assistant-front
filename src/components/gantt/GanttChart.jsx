// components/gantt/GanttChart.jsx
import React, { useRef, useState } from "react"
import moment from "moment"
import AutoSize from "../element/AutoSizeComponent"
import GanttBarArea from "./GanttBarArea"

const rowHeight = 21
const headerHeight = 40
const scrollBarHeight = 20

export function GanttChart({
  rows,
  startDate,
  endDate,
  addRowLabel,
  onAddRow,
  onInsertRowAbove,
  onInsertRowBelow,
  onMoveRowLeft,
  onMoveRowRight,
  onMoveRowUp,
  onMoveRowDown,
  onRowClick,
  onInsertChildRow,
  onRemoveRow,
  T
}) {
  const containerRef = useRef(null)
  const [hoverIndex, setHoverIndex] = useState(null)

  const labelStyle = {
    height: rowHeight,
    paddingTop: 0,
    whiteSpace: "nowrap",
    cursor: onRowClick ? "pointer" : "arrow"
  }

  const handleMouseMove = (ev) => {
    if (!containerRef.current) return
    let target = ev.target
    while (target) {
      if (target.classList.contains("dropdown-menu")) return
      target = target.parentElement
    }
    const y = ev.clientY - containerRef.current.getBoundingClientRect().top
    const rowIndex = Math.floor((y - headerHeight) / rowHeight)
    setHoverIndex(rowIndex >= 0 && rowIndex < rows.length ? rowIndex : null)
  }

  const handleMouseLeave = () => setHoverIndex(null)

  const handleClick = (ev) => {
    if (!containerRef.current) return
    let target = ev.target
    while (target) {
      if (target.classList.contains("menu")) return
      target = target.parentElement
    }
    const y = ev.clientY - containerRef.current.getBoundingClientRect().top
    const rowIndex = Math.floor((y - headerHeight) / rowHeight)
    if (rowIndex >= 0 && rowIndex < rows.length && onRowClick) {
      onRowClick(rowIndex)
    }
  }

  const renderLabel = (row, index) => {
    const canMoveLeft = onMoveRowLeft && row.level > 0 && index > 0 && rows[index - 1].level === row.level - 1
    const canMoveRight = onMoveRowRight && index > 0 && rows[index - 1].level === row.level

    let canMoveUp = false
    for (let i = index - 1; i >= 0; i--) {
      if (rows[i].level < row.level) break
      if (rows[i].level === row.level) {
        canMoveUp = onMoveRowUp != null
        break
      }
    }

    let canMoveDown = false
    for (let i = index + 1; i < rows.length; i++) {
      if (rows[i].level < row.level) break
      if (rows[i].level === row.level) {
        canMoveDown = onMoveRowDown != null
        break
      }
    }

    const showMenu =
      canMoveLeft || canMoveRight || canMoveUp || canMoveDown ||
      onInsertRowBelow || onInsertRowAbove || onInsertChildRow || onRemoveRow

    return (
      <div
        key={index}
        className="gantt-label"
        style={{ ...labelStyle, paddingLeft: row.level * 10, position: "relative", paddingRight: 25 }}
      >
        <span style={{ fontSize: 12 }} onClick={() => onRowClick?.(index)}>
          {row.label}
        </span>
        {showMenu && (
          <div className="menu" style={{ position: "absolute", right: 5, top: 1 }}>
            <div style={{ cursor: "pointer", visibility: hoverIndex === index ? "visible" : "hidden" }} data-bs-toggle="dropdown">
              <i className="fa fa-caret-square-o-down text-primary" />
            </div>
            <ul className="dropdown-menu" style={{ marginTop: 0 }}>
              {onInsertRowAbove && (
                <li><a className="dropdown-item" onClick={() => onInsertRowAbove(index)}><i className="fa fa-fw text-muted fa-chevron-up" /> {T("Add Above")}</a></li>
              )}
              {onInsertRowBelow && (
                <li><a className="dropdown-item" onClick={() => onInsertRowBelow(index)}><i className="fa fa-fw text-muted fa-chevron-down" /> {T("Add Below")}</a></li>
              )}
              {onInsertChildRow && (
                <li><a className="dropdown-item" onClick={() => onInsertChildRow(index)}><i className="fa fa-fw text-muted fa-chevron-right" /> {T("Add Subitem")}</a></li>
              )}
              {canMoveUp && (
                <li><a className="dropdown-item" onClick={() => onMoveRowUp(index)}><i className="fa fa-fw text-muted fa-arrow-up" /> {T("Move Up")}</a></li>
              )}
              {canMoveDown && (
                <li><a className="dropdown-item" onClick={() => onMoveRowDown(index)}><i className="fa fa-fw text-muted fa-arrow-down" /> {T("Move Down")}</a></li>
              )}
              {canMoveLeft && (
                <li><a className="dropdown-item" onClick={() => onMoveRowLeft(index)}><i className="fa fa-fw text-muted fa-arrow-left" /> {T("Move Left")}</a></li>
              )}
              {canMoveRight && (
                <li><a className="dropdown-item" onClick={() => onMoveRowRight(index)}><i className="fa fa-fw text-muted fa-arrow-right" /> {T("Move Right")}</a></li>
              )}
              {onRemoveRow && (
                <li><a className="dropdown-item" onClick={() => onRemoveRow(index)}><i className="fa fa-fw text-muted fa-remove" /> {T("Remove")}</a></li>
              )}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      style={{ position: "relative" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      ref={containerRef}
    >
      <style>{`@media print { .no-print { display: none } }`}</style>
      {hoverIndex != null && (
        <div
          style={{
            left: 0,
            right: 0,
            top: headerHeight + rowHeight * hoverIndex,
            height: rowHeight,
            position: "absolute",
            backgroundColor: "#EEE"
          }}
        />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
        <div style={{ paddingLeft: 5, paddingTop: headerHeight, marginBottom: scrollBarHeight }}>
          {rows.map(renderLabel)}
          {onAddRow && (
            <div className="no-print">
              <a style={{ fontSize: 12, cursor: "pointer" }} onClick={onAddRow}>
                {addRowLabel || <i className="fa fa-plus" />}
              </a>
            </div>
          )}
        </div>
        <AutoSize injectWidth injectHeight>
          {size =>
            size.width && size.height ? (
              <GanttBarArea
                width={size.width - 5}
                height={size.height}
                startDate={startDate}
                endDate={endDate}
                rows={rows}
                onRowClick={onRowClick}
              />
            ) : (
              <div />
            )
          }
        </AutoSize>
      </div>
    </div>
  )
}

export default GanttChart
