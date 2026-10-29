import React from "react";
import { useIntl } from "react-intl";

const CurrentLocationButton = ({ onClick }) => {
  const intl = useIntl();
  return (
    <button
      type="button"
      id="current_location_button"
      onClick={onClick}
      aria-label={intl.formatMessage({ id: "location.show" })}
    >
      <img src="/public/images/Im_here.png" alt="" />
    </button>
  );
};

export default CurrentLocationButton;
