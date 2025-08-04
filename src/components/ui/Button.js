import React from "react";
import classNames from "classnames";
import "./button.css";

export default function Button({ children, onClick, variant = "default", className = "", ...rest }) {
  return (
    <button
      onClick={onClick}
      className={classNames("ui-button", variant, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
