import React, { useState } from "react";
import ModalPopupComponent from "./ModalPopupComponent";

export default function PopoverHelpComponent({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "inline-block" }}>
      {open && (
        <ModalPopupComponent showCloseX={true} onClose={() => setOpen(false)} size="large">
          {children}
        </ModalPopupComponent>
      )}
      <i
        className="text-muted fa fa-question-circle"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(true)}
      />
    </div>
  );
}
