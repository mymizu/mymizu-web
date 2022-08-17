import React from "react";

const BackButton = ({ onClick, direction, className }) => {
  return (
    <button className={className} onClick={onClick}>
      <img id="back" src="/public/images/close-button.svg" alt="" />
    </button>
  );
};
export default BackButton;
