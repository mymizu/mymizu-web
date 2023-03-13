import React from "react";
import "./ListGrid.css";

export const Grid = ({children}) => {
  return (
    <div className="grid-container">
     {children}
    </div>
  );
};
