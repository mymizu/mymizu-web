import React from "react";

const BackButton = ({ onClick, direction, className }) => {
  return (
    <button className={className} onClick={onClick}>
      <img id="back" src="/public/images/close-button.svg" alt="" width="20" height="20" />
    </button>
  );
};
export default BackButton;
