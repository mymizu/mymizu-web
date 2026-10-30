import React from "react";
import { useIntl } from "react-intl";

const DropdownButton = ({ onClick, dropdownOpen, controls }) => {
  const intl = useIntl();
  return (
    <button
      type="button"
      onClick={onClick}
      className="dropdown-button"
      aria-label={intl.formatMessage({ id: "spot.hours.toggle" })}
      aria-expanded={dropdownOpen}
      aria-controls={controls}
    >
      <img
        src="/public/images/back-arrow.svg"
        alt=""
        style={{ transform: dropdownOpen ? "rotate(90deg)" : "rotate(-90deg)", width: "100%" }}
      />
    </button>
  );
};

export default DropdownButton;
