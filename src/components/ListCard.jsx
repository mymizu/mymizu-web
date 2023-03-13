import React from "react";
import "./ListCard.css";
import locationButton from "/images/map-pin-gold.svg";

export const ListCard = ({ data }) => {
  console.log(data.data);
  const cardRender = data.data.map((info) => {
    console.log(info);
    return (
      <div className="modal-card-container">
        <a href={info.website}>
          <div className="modal-card-contents">
            <img src={info.photos[0].url} className="modal-card-picture" />
            <div className="modal-card-details">
              <p className="shop-list-name">
                <img src={locationButton} className="location-icon" />
                {info.name}
              </p>
              <p className="shop-list-body">{info.grouped_tags["Water"].map((item)=>{return `${item} `})}</p>
            </div>
          </div>
        </a>
      </div>
    );
  });
  return <>{cardRender}</>;
};
