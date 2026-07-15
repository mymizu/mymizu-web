import React from "react";
import classnames from "classnames";

// Tap::COOLING_SHELTER_CATEGORY_ID (backend) = 6
const COOLING_SHELTER_CATEGORY_ID = 6;
const BUSINESS_CATEGORY_ID = 4;

export const Marker = ({ category, isSearch, isActive }) => {
  // Base pin variant (before any "-active" suffix is applied). Every variant
  // -- map-pin, map-pin-gold, map-shelter, map-shelter-gold, map-pin-natural
  // -- has a matching "<name>-active.svg" asset, so activation is just a
  // filename swap rather than a per-category special case.
  const getBasePinName = () => {
    if (category === BUSINESS_CATEGORY_ID) {
      return "map-pin-gold";
    }
    if (category === COOLING_SHELTER_CATEGORY_ID) {
      return "map-shelter";
    }

    return "map-pin";
  };

  const getPinSrc = () => {
    const base = getBasePinName();
    const suffix = isActive ? "-active" : "";
    return `/public/images/${base}${suffix}.svg`;
  };

  return (
    <div className="marker">
      <img
        className={classnames(`pin`, {
          ["pin-large"]: isSearch,
        })}
        src={getPinSrc()}
      />
    </div>
  );
};
