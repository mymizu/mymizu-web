import React from "react";

const DropdownButton = ({ onClick, dropdownOpen }) => {
  return (
    <button onClick={onClick} className="dropdown-button">
      <img
        src="/public/images/back-arrow.svg"
        alt=""
        style={{ transform: dropdownOpen ? "rotate(90deg)" : "rotate(-90deg)", width: "100%" }}
      />
    </button>
  );
};

export default DropdownButton;
