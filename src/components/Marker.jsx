import React from "react"

export const Marker = ({ category }) => (
  <div className="marker">
    {category === 4 ? (
      <img className="pin" src="/public/images/map-pin-gold.svg" />
    ) : (
      <img className="pin" src="/public/images/map-pin.svg" />
    )}
  </div>
);
