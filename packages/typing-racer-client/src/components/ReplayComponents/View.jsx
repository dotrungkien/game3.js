import React, { CSSProperties, ReactNode } from "react";

const FLEX = {
  display: "flex",
  alignItems: "center",
};

const CENTER_FLEX = {
  justifyContent: "center",
};

const COLUMN_FLEX = {
  flexDirection: "column",
};

export default function View(props) {
  const {
    flex = false,
    center = false,
    column = false,
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    onClick,
  } = props;

  return (
    <div
      style={{
        ...(flex && FLEX),
        ...(center && CENTER_FLEX),
        ...(column && COLUMN_FLEX),
        ...style,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
