import React from "react";

export const RouteButton = ({
  latitude,
  longitude
                            }) => {

  const onClickRoute = () => {
    if (!latitude || !longitude) {
      console.error('Lat long not set')
      return
    }
    window.open(`http://www.google.com/maps/place/${latitude},${longitude}`, '_blank')
  }

  return (
    <div>
      <button className="route-button" onClick={onClickRoute}>Route</button>
    </div>
  );
};
