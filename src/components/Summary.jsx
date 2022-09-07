import React, { useState } from "react";
import { ShareModal } from "./ShareModal";
import { ShareButton } from "./Buttons/ShareButton";
import { RouteButton } from "./Buttons/RouteButton";
import { Marker } from "./Marker";

export const Summary = ({ data }) => {
  const [shareModal, setShareModal] = useState(false);

  return (
    <div className="summary">
      <div className="title">
        <Marker category={data.categoryId} />
        <h6>{data?.title}</h6>
      </div>
      <div className="description">
        <div>Type of water: {data.description.Water}</div>
        <div>Facilities:</div>
      </div>
      <div className="actionbuttons">
        <RouteButton latitude={data.latitude} longitude={data.longitude} />
        <ShareButton setShareModal={setShareModal} shareModal={shareModal} />
      </div>
      {shareModal ? (
        <div className="modal-container">
          <ShareModal data={data} setShareModal={setShareModal} />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
