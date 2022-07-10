import React from "react";

const ArrowButton = ({ onClick, direction }) => {
  return (
    <button className={"back-button"} onClick={onClick}>
      <img id="back" src={direction === "back" ? "/public/images/back-arrow.svg" : "/public/images/forward-arrow.svg"} alt="" height="26" />
    </button>
  );
};
export default ArrowButton