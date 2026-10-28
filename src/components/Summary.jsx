import React from "react";
import { useIntl } from "react-intl";
import { ShareButton } from "./Buttons/ShareButton";
import { RouteButton } from "./Buttons/RouteButton";

// The card's heading. Modal labels the card with it and moves focus to it
// when a spot is opened from the map.
export const SPOT_TITLE_ID = "spot-card-title";

export const Summary = ({ data, setShareModal }) => {
  const intl = useIntl();

  return (
    <div className="summary">
      <div className="title">
        {data.categoryId === 4 && (
          <img
            className="pin"
            src="/public/images/map-pin-gold.svg"
            alt={intl.formatMessage({ id: "spot.category.partner" })}
          />
        )}
        {data.categoryId === 6 && (
          <img
            className="pin"
            src="/public/images/map-shelter.svg"
            alt={intl.formatMessage({ id: "spot.category.shelter" })}
          />
        )}
        {data.categoryId !== 4 && data.categoryId !== 6 && (
          <img
            className="pin"
            src="/public/images/map-pin.svg"
            alt={intl.formatMessage({ id: "spot.category.spot" })}
          />
        )}
        {/* tabIndex lets Modal move focus here when the card opens. */}
        <h2 id={SPOT_TITLE_ID} className="spot-card-title" tabIndex={-1}>
          {data?.title}
        </h2>
      </div>
      <div className="description">
        {data.description !== null &&
          Object.keys(data.description).map((name, index) => {
            return (
              <p key={index}>
                {name}: {Object.values(data.description[name].join(" • "))}
              </p>
            );
          })}
      </div>
      <div className="actionbuttons">
        <RouteButton latitude={data.latitude} longitude={data.longitude} id={data.id} />
        <ShareButton setShareModal={setShareModal} id={data.id} />
      </div>
    </div>
  );
};
