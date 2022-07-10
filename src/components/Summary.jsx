import React, { useState } from "react";
import { ShareModal } from "./ShareModal";
import { ShareButton } from "./Buttons/ShareButton";

export const Summary = ({ data }) => {
  const [shareModal, setShareModal] = useState(false)
//   const waterType = data?.description?.water?.join(", ") ?? "";
//   const facilityType = data.description.facilities.join(", ");

  return (
    <div className="summary">
      <h6 className="Title">{data?.title}</h6>
      <div>Type of water: {data.description.Water}</div>
      <div>Opening Hours: {data?.description?.opening_hours ?? ""}</div>
      <div>Facilities: {/*facilityType ? facilityType : ""*/}</div>
      {/* route and share buttons go here */}
      <div>Buttons</div>
      <ShareButton setShareModal={setShareModal} shareModal={shareModal} />
      {shareModal ? 
      <div className="modal-container">
        <ShareModal data={data} />
        </div> : ""}
    </div>
  );
};
