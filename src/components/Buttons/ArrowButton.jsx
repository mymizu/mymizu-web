import React from "react";
import { useIntl } from "react-intl";

const ArrowButton = ({ onClick, direction, className }) => {
  const intl = useIntl();
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={intl.formatMessage({
        id: direction === "back" ? "carousel.previous" : "carousel.next",
      })}
    >
      <img
        id="back"
        src={
          direction === "back"
            ? "/public/images/back-arrow.svg"
            : "/public/images/forward-arrow.svg"
        }
        alt=""
      />
    </button>
  );
};
export default ArrowButton;
