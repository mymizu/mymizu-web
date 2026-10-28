import React from "react";
import { useIntl } from "react-intl";

const BackButton = ({ onClick, className }) => {
  const intl = useIntl();
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={intl.formatMessage({ id: "spot.close" })}
    >
      <img id="back" src="/public/images/close-button.svg" alt="" width="20" height="20" />
    </button>
  );
};
export default BackButton;
