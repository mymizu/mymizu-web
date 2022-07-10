import React from "react";

const ArrowButton = ({ onClick, direction, className }) => {
  return (
    <button className={className}  onClick={onClick}>
      <img id="back" src={direction === "back" ? "/public/images/back-arrow.svg" : "/public/images/forward-arrow.svg"} alt=""  />
    </button>
  );
};
export default ArrowButton