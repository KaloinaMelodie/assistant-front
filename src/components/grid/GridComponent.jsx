import React, { useEffect, useRef } from "react"
import CellRenderer from "./CellRenderer"
import EditorRenderer from "./EditorRenderer"
import GridLines from "./GridLines"
import SelectionBox from "./SelectionBox"
import ColHeaderRenderer from "./ColHeaderRenderer"
import RowHeaderRenderer from "./RowHeaderRenderer"
import ColResizers from "./ColResizers"
import CornerCell from "./CornerCell"

const GridComponent = ({
  rows,
  cols,
  colWidths,
  rowHeight,
  colHeaderHeight,
  scrollLeft,
  scrollTop,
  selectedCell,
  editingCell,
  colResizing,
  colResizingDelta,
  renderCell,
  renderCellEditor,
  renderColHeader,
  renderRowHeader,
  renderTopLeft,
  onCellMouseDown,
  onCellDoubleClick,
  onColResizeStart
}) => {
  const containerRef = useRef(null)

  const colXs = cols.reduce((acc, _, i) => {
    acc[i] = (acc[i - 1] || 0) + (colWidths[i - 1] || 0)
    return acc
  }, [])

  const visibleCols = cols.filter((_, i) => {
    const x = colXs[i]
    return x + colWidths[i] >= scrollLeft && x <= scrollLeft + containerRef.current?.clientWidth
  })

  const visibleRows = rows.filter((_, r) => {
    const y = r * rowHeight + colHeaderHeight
    return y + rowHeight >= scrollTop && y <= scrollTop + containerRef.current?.clientHeight
  })

  return (
    <div style={{ position: "relative", overflow: "auto" }} ref={containerRef}>
      {/* Column Headers */}
      {visibleCols.map((_, col) => (
        <ColHeaderRenderer
          key={col}
          col={col}
          left={colXs[col] - scrollLeft}
          scrollTop={0}
          colWidth={colWidths[col]}
          height={colHeaderHeight}
          selected={selectedCell?.col === col && selectedCell?.row === null}
          renderColHeader={renderColHeader}
        />
      ))}

      {/* Row Headers */}
      {visibleRows.map((_, row) => (
        <RowHeaderRenderer
          key={row}
          row={row}
          top={row * rowHeight + colHeaderHeight - scrollTop}
          scrollLeft={0}
          width={50} // fixed row header width
          height={rowHeight}
          selected={selectedCell?.row === row && selectedCell?.col === null}
          renderRowHeader={renderRowHeader}
        />
      ))}

      {/* Corner Cell */}
      <CornerCell
        scrollLeft={0}
        scrollTop={0}
        width={50}
        height={colHeaderHeight}
        renderTopLeft={renderTopLeft}
      />

      {/* Grid Cells */}
      {visibleRows.map((_, rowIdx) => (
        visibleCols.map((_, colIdx) => {
          const row = rowIdx
          const col = colIdx
          const left = colXs[col] - scrollLeft
          const top = row * rowHeight + colHeaderHeight - scrollTop

          if (editingCell?.row === row && editingCell?.col === col) {
            return (
              <EditorRenderer
                key={`edit-${row}-${col}`}
                row={row}
                col={col}
                left={left}
                top={top}
                width={colWidths[col]}
                height={rowHeight}
                saving={false}
                renderCellEditor={renderCellEditor}
                setSaveEdit={() => {}}
                onEndEdit={() => {}}
              />
            )
          }

          return (
            <CellRenderer
              key={`cell-${row}-${col}`}
              row={row}
              col={col}
              left={left}
              top={top}
              width={colWidths[col]}
              height={rowHeight}
              selected={selectedCell?.row === row && selectedCell?.col === col}
              onMouseDown={() => onCellMouseDown(row, col)}
              onDoubleClick={() => onCellDoubleClick(row, col)}
              renderCell={renderCell}
            />
          )
        })
      ))}

      {/* Selection Box */}
      {selectedCell?.row != null && selectedCell?.col != null && (
        <SelectionBox
          row={selectedCell.row}
          col={selectedCell.col}
          colXs={colXs}
          rowHeight={rowHeight}
          colHeaderHeight={colHeaderHeight}
          colWidths={colWidths}
        />
      )}

      {/* Grid Lines */}
      <GridLines
        colXs={colXs}
        rowStart={0}
        rowEnd={rows.length - 1}
        colStart={0}
        colEnd={cols.length - 1}
        rowHeight={rowHeight}
        colHeaderHeight={colHeaderHeight}
        colWidths={colWidths}
      />

      {/* Column Resizers */}
      <ColResizers
        colXs={colXs}
        colWidths={colWidths}
        colResizing={colResizing}
        colResizingDelta={colResizingDelta}
        scrollTop={0}
        onMouseDown={onColResizeStart}
        colHeaderHeight={colHeaderHeight}
        height={containerRef.current?.clientHeight || 0}
      />
    </div>
  )
}

export default GridComponent;
