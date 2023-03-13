import React, { useEffect, useState } from "react";
import "./ListModal.css";

export const ListModal = ( {children}) => {
  return <div className="modal-container">{children}</div>;
};
