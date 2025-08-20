import React from "react";
import classNames from "classnames";

export default function Pane({ split = "vertical", width, children }) {
  const isVertical = split === "vertical";
  const style = {
    flex: width ? "0 0 auto" : 1,
    position: "relative",
    ...(isVertical
      ? { width: width ?? "100%" }
      : { height: width ?? "100%" })
  };

  const classes = classNames(
    "pane",
    isVertical ? "vertical" : "horizontal",
    { first: !!width }
  );

  return <div className={classes} style={style}>{children}</div>;
}
