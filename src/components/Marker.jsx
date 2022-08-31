import React from "react";
import classnames from "classnames";

export const Marker = ({ category, isSearch }) => {
  return (
    <div className="marker">
      {category === 4 ? (
        <img
          className={classnames(`pin`, {
            ["pin-large"]: isSearch,
          })}
          src="/public/images/map-pin-gold.svg"
        />
      ) : (
        <img className="pin" src="/public/images/map-pin.svg" />
      )}
    </div>
  );
};
