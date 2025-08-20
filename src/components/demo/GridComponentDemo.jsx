import React, { useState, useCallback } from "react";
import ReactSelect from "react-select";
import GridComponent from "../grid/GridComponent";

const Editor = ({ width, setSaveEdit }) => {
  const [value, setValue] = useState(null);

  setSaveEdit(() => {
    return () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 500);
      });
  });

  const selectRef = useCallback((node) => {
    if (node) {
      setTimeout(() => {
        node.focus();
      }, 0);
    }
  }, []);

  return (
    <div style={{ width }}>
      <ReactSelect
        ref={selectRef}
        isMulti
        options={[
          { value: "x", label: "X" },
          { value: "y", label: "Y" },
        ]}
        value={value}
        onChange={setValue}
        onBlur={() => console.log("onBlur")}
      />
    </div>
  );
};

const GridComponentDemo = () => {
  const [colWidths, setColWidths] = useState([100, 200, 300]);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [colResizing, setColResizing] = useState(null);
  const [colResizingDelta, setColResizingDelta] = useState(0);

  const rows = Array.from({ length: 2 }, (_, i) => i);
  const cols = Array.from({ length: 3 }, (_, i) => i);

  const renderCell = ({ row, col }) => {
    return <div style={{ padding: 10 }}>{`cell ${row}:${col}`}</div>;
  };

  const renderColHeader = ({ col }) => {
    return <div style={{ padding: 5 }}>{`Header ${col}`}</div>;
  };

  const renderRowHeader = ({ row }) => {
    return (
      <div style={{ padding: 10 }}>
        <i className="fa fa-leaf" /> Row {row}
      </div>
    );
  };

  const renderCellEditor = ({ row, col, width, setSaveEdit }) => {
    return <Editor width={width} setSaveEdit={setSaveEdit} />;
  };

  return (
    <div style={{ height: "600px", width: "100%", padding: 20 }}>
      <GridComponent
        rows={rows}
        cols={cols}
        colWidths={colWidths}
        rowHeight={40}
        colHeaderHeight={32}
        scrollLeft={scrollLeft}
        scrollTop={scrollTop}
        selectedCell={selectedCell}
        editingCell={editingCell}
        colResizing={colResizing}
        colResizingDelta={colResizingDelta}
        renderCell={renderCell}
        renderCellEditor={renderCellEditor}
        renderColHeader={renderColHeader}
        renderRowHeader={renderRowHeader}
        renderTopLeft={() => <strong>📍</strong>}
        onCellMouseDown={(row, col) => setSelectedCell({ row, col })}
        onCellDoubleClick={(row, col) => setEditingCell({ row, col })}
        onColResizeStart={(index) => setColResizing(index)}
      />
    </div>
  );
};

export default GridComponentDemo;
