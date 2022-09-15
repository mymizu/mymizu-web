import React, { useState } from "react";
import { ShareButton } from "./Buttons/ShareButton";
import { RouteButton } from "./Buttons/RouteButton";

export const Summary = ({ data, setShareModal }) => {


  return (
    <div className="summary">
      <div className="title">
        {data.categoryId === 4 ? (
          <img className="pin" src="/public/images/map-pin-gold.svg" />
        ) : (
          <img className="pin" src="/public/images/map-pin.svg" />
        )}
        <h6>{data?.title}</h6>
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
