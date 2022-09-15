import React from "react";
import {FormattedMessage} from "react-intl";

export const RouteButton = ({
  latitude,
  longitude,
  id
                            }) => {

  const onClickRoute = () => {
    /*ReactGA.event({
      category: 'Refill Spot',
      action: 'Clicked route button',
      label: id,
    });*/
    if (!latitude || !longitude) {
      console.error('Lat long not set')
      return
    }
    window.open(`http://www.google.com/maps/place/${latitude},${longitude}`, '_blank')
  }

  return (
    <div>
      <button className="route-button" onClick={onClickRoute}><FormattedMessage id="spot.route" /></button>
    </div>
  );
};
