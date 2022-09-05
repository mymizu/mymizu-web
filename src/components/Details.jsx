import React from "react";

export const Details = ({ data }) => {
  const commentArray = data.comment.split("\n");
  const refill = commentArray.indexOf("How to Refill:\r");
  const refillMethod = commentArray[refill + 1];

  return (
    <div>
      <div className="border-blue"></div>
      {data.refillMethod && (
      <div className="detail-section">
        <img src="/public/images/cup.svg" alt="" />
        <div>{data.refillMethod}</div>
      </div>
      )}
      {data.openingHours && (
        <div className="detail-section">
          <img src="/public/images/clock.svg" alt="" />
          <div>
            {Object.keys(data.openingHours).map((key, keyIdx) => (
              <div className="place-open-section" key={keyIdx}>
                <p className="place-open-day">{key}</p>
                <p>{data.openingHours[key][0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.link && (
        <div className="detail-section">
          <img src="/public/images/globe.svg" alt="" />
          <div>{data.link}</div>
        </div>
      )}
      {data.address && (
        <div className="detail-section">
          <img src="/public/images/pin_drop.svg" alt="" />
          <div>{data.address}</div>
        </div>
      )}
      <div className="detail-section">
        <img src="/public/images/info.svg" alt="" />
        <div>Report/Suggest change to details</div>
      </div>
      <div className="detail-section">
        <img src="/public/images/edit.svg" alt="" />
        <div>Feedback: {data.description.feedback}</div>
      </div>
    </div>
  );
};
