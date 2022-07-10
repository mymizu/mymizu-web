import React from "react";

const BackButton = ({ onClick, direction, className }) => {
  return (
    <button className={className} onClick={onClick}>
      <img id="back" src="/public/images/modal-back-arrow.svg" alt=""  />
    </button>
  );
};
export default BackButton