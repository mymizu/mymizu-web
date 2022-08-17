import React from "react";
// import CupIcon from "../../public/images/cup.svg";
// import cup from "../../public/images/cup.svg";
// import clock from "../../public/images/clock.svg";
// import globe from "../../public/images/globe.svg";

export const Details = ({ data }) => {
  const commentArray = data.comment.split("\n");
  const refill = commentArray.indexOf("How to Refill:\r");
  const refillMethod = commentArray[refill + 1];

  console.log(data);

  return (
    <div>
      <div className="border-blue"></div>
      <div className="detail-section">
        <img src="/public/images/cup.svg" alt="" />
        <div>{refillMethod}</div>
      </div>
      {data.openingHours && (
        <div className="detail-section">
          <img src="/public/images/clock.svg" alt="" />
          <div>{data.openingHours}</div>
        </div>
      )}
      {data.link && (
        <div className="detail-section">
          <img src="/public/images/globe.svg" alt="" />
          <div>Link: {data.link}</div>
        </div>
      )}
      {data.address && (
        <div className="detail-section">
          <div>Address: {data.address}</div>
        </div>
      )}
      <div className="detail-section">
        <div>Report/Suggest change to details</div>
      </div>
      <div className="detail-section">
        <div>Feedback: {data.description.feedback}</div>
      </div>
    </div>
  );
};
