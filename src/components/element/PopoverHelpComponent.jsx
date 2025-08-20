import React, { useRef, useEffect } from "react";
import { renderToString } from "react-dom/server"; // ← utiliser ce module
import Popover from "bootstrap/js/dist/popover";

export default function PopoverHelpComponent({
  placement = "top",
  trigger = "hover",
  content,
  children
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const rendered = renderToString(children); // ← render as string
      const contentDiv = document.createElement("div");
      contentDiv.innerHTML = rendered;

      const popover = new Popover(ref.current, {
        content: contentDiv,
        trigger,
        placement,
        html: true
      });

      return () => popover.dispose(); // cleanup
    }
  }, [children, placement, trigger]);

  return (
    <span ref={ref}>
      {content ? (
        content
      ) : (
        <span className="text-muted" style={{ cursor: "pointer" }}>
          <i className="fa fa-question-circle" />
        </span>
      )}
    </span>
  );
}
