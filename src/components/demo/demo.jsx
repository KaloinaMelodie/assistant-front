import React, { useState,useEffect } from "react";
import { createRoot } from "react-dom/client";
import ModalPopupComponent from "../element/ModalPopupComponent";
import ModalWindowComponent from "../element/ModalWindowComponent";
import VerticalTreeLayoutComponent from "../layout/VerticalTreeLayoutComponent";
import ReorderableListComponent from "../../reorderable/ReorderableListComponent";
import PopoverHelpComponent from "../element/PopoverHelpComponent";
import PopupHelpComponent from "../element/PopupHelpComponent";
import FillDownwardComponent from "../layout/FillDownwardComponent";
import AutoSizeComponent from "../element/AutoSizeComponent";
import * as ui from "../bootstrap/bootstrap";
import ReactElementPrinter from "../element/ReactElementPrinter";
import GridComponentDemo from "./GridComponentDemo";
import GanttChartDemo from "./GanttChartDemo";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import ListEditorComponent from "../element/ListEditorComponent";
import LoadingComponent from "../element/LoadingComponent"; 
import TabbedComponentDemo from "../layout/TabbedComponentDemo"; 
import VerticalLayoutComponentDemo from "./VerticalLayoutComponentDemo"; 

import SplitPane from "../layout/SplitPane"



function PopoverHelpSample() {
  return (
    <div style={{ padding: 20 }}>
      <p>Lorem ipsum dolor sit amet <PopoverHelpComponent>This is a help popover</PopoverHelpComponent></p>
    </div>
  );
}

function PopupHelpSample() {
  return (
    <div style={{ padding: 20 }}>
      <p>Lorem ipsum dolor sit amet</p> <PopupHelpComponent>This is a help popup</PopupHelpComponent>
    </div>
  );
}

function ReactElementPrinterSample() {
  const handlePrint = () => {
    const printer = new ReactElementPrinter();
    const elem = <h1>Print this!</h1>;
    printer.print(elem, {});
  };

  return (
    <div>
      <button type="button" onClick={handlePrint}>Print</button>
      DO NOT PRINT THIS
    </div>
  );
}

function ModalWindowSample() {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <a onClick={() => setEditing(true)}>Edit me</a>
      {editing && (
        <ModalWindowComponent isOpen={editing} onRequestClose={() => setEditing(false)}>
          {Array.from({ length: 99 }, (_, x) => <div key={x}>{x + 1}</div>)}
        </ModalWindowComponent>
      )}
    </div>
  );
}

function ModalPopupSample() {
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <a onClick={() => setEditing(true)}>Edit me</a>
      {editing && (
        <ModalPopupComponent onClose={() => setEditing(false)} showCloseX width={350}>
          {Array.from({ length: 99 }, (_, x) => <div key={x}>{x + 1}</div>)}
        </ModalPopupComponent>
      )}
    </div>
  );
}

function AutoSizeTestComponent() {
  return (
    <AutoSizeComponent injectHeight>
      {({ height }) => (
        <div style={{ height: height + 1, backgroundColor: "#FDF" }}>{JSON.stringify({ height })}</div>
      )}
    </AutoSizeComponent>
  );
}

function ToggleTestComponent() {
  const [action, setAction] = useState("keep");

  return (
    <ui.Toggle
      value={action}
      options={[
        { value: "keep", label: "Keep" },
        { value: "merge", label: "Merge" },
        { value: "nd", label: "Not duplicate" },
        { value: "ignore", label: "Ignore" }
      ]}
      onChange={setAction}
      size="xs"
    />
  );
}

function ListEditorSample() {
  const [items, setItems] = useState(["Apple", "Banana", "Cherry"]);
  return (
    <ListEditorComponent
      items={items}
      onItemsChange={setItems}
      renderItem={(item, index) => <div key={item}>{item}</div>}
      getReorderableKey={(item, index) => index}
    />
  );
}


function ReorderSimpleSample() {
  const initialItems = [
    { id: "1", label: "Item 1" },
    { id: "2", label: "Item 2" },
    { id: "3", label: "Item 3" }
  ]
  const [items, setItems] = useState(initialItems)
  return (
    <ReorderableListComponent
      items={items}
      getItemId={(item) => item.id}
      onReorder={(newItems) => { console.log("NOUVEL ORDRE", newItems); setItems }}
      renderItem={(item, index, drag, preview, drop, extra) => (
        <div
          ref={extra.ref}
          //   style={{ padding: 10, border: "1px solid #ddd" }}
          style={{
            opacity: extra.isDragging ? 0.5 : 1,
            border: "1px solid black",
            padding: "8px",
            margin: "4px",
            background: "#fff"
          }}
        >
          {item.label}
        </div>
      )}
    />

  );
}


function Block({ label, color = "#add8e6", height = 50 }) {
  return (
    <div
      style={{
        height,
        width: 100,
        backgroundColor: color,
        border: "1px solid #333",
        borderRadius: 4,
        textAlign: "center",
        lineHeight: `${height}px`,
        margin: 4
      }}
    >
      {label}
    </div>
  );
}

function DemoVerticalTreeLayout() {
  return (
    <div style={{ padding: 30 }}>
      <VerticalTreeLayoutComponent
        line="2px solid #555"
        height={30}
        headElem={<Block label="Root" color="#ffcccb" />}
      >
        <Block label="Child 1" />
        <Block label="Child 2" color="#90ee90" />
        <Block label="Child 3" color="#f0e68c" />
        <Block label="Child 4" color="#dda0dd" />
      </VerticalTreeLayoutComponent>
    </div>
  );
}



function DemoFillDownward() {
  return (
    <div style={{ height: "50vh", display: "flex", flexDirection: "column", backgroundColor: "#add8e6" }}>
    {/* <div> */}
      {/* Header */}
      <div style={{ height: 100, backgroundColor: "#ffcccb", textAlign: "center", lineHeight: "100px" }}>
        Header fixe
      </div>

      {/* Zone remplie automatiquement */}
      <FillDownwardComponent>
        <div style={{ height: "100%", backgroundColor: "#add8e6", overflow: "auto", padding: 20 }}>
          <h3>Contenu qui remplit l'espace restant</h3>
          <p>Voici un exemple de contenu qui remplit automatiquement la hauteur disponible.</p>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i}>Ligne {i + 1}</div>
          ))}
        </div>
      </FillDownwardComponent>
    </div>
  );
}

const LoadingComponentDemo = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simule un chargement de 3 secondes
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ height: "20vh", background: "#f9f9f9", padding: 20 }}>
      <h2>Demo: LoadingComponent</h2>
      {isLoading ? (
        <LoadingComponent label="Veuillez patienter..." />
      ) : (
        <div style={{ fontSize: 24, color: "green" }}>
          Données chargées !
        </div>
      )}
    </div>
  );
};


const SplitPaneDemo = () => {
  return (
    <div style={{ height: "500px", width: "100%", border: "1px solid #ccc" }}>
      <SplitPane split="vertical" firstPaneSize={250}>
        <div style={{ background: "#e0f7fa", height: "100%" }}>
          <h3>Pane de gauche</h3>
        </div>
        <div style={{ background: "#fce4ec", height: "100%" }}>
          <h3>Pane de droite</h3>
        </div>
      </SplitPane>
    </div>
  )
}

function AppDemo() {
  return (
    <>
      {/* <DndProvider backend={HTML5Backend}> */}
      <div style={{ padding: 20 }}>
        <h2>Loading Demo</h2>
        <LoadingComponentDemo/>
        <h2>Gantt Chart Demo</h2>
        <GanttChartDemo />

        <h2>Popover Help</h2>
        <PopoverHelpSample />

        <h2>Popup Help</h2>
        <PopupHelpSample />

        <h2>Modal Window</h2>
        <ModalWindowSample />

        <h2>Modal Popup</h2>
        <ModalPopupSample />

        <h2>Auto Size Component</h2>
        {/* <AutoSizeTestComponent /> */}

        <h2>Toggle Component</h2>
        <ToggleTestComponent />

        <h2>List Editor</h2>
        <ListEditorSample />

        <h2>Reorder List</h2>
        <ReorderSimpleSample />

        <h2>React Element Printer</h2>
        <ReactElementPrinterSample />

        


        <h2>Grid Component</h2>
        {/* <GridComponentDemo/> */}

        <h2>Tabbed Component</h2>
        <TabbedComponentDemo/> 

        <h2>Vertical tree layout</h2>
        <DemoVerticalTreeLayout/>
        
        <h2>Vertical layout</h2>
        <VerticalLayoutComponentDemo/>

        <h2>Fill downrad</h2>
        <DemoFillDownward/>
        
        <h2></h2>
        <SplitPaneDemo/>

      </div>
      {/* </DndProvider> */}
    </>
  );
}

export default AppDemo;

// const container = document.getElementById("main");
// const root = createRoot(container);
// root.render(<App />);
