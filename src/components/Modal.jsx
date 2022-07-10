import React from "react";
import { Summary } from "./Summary";
import { Details } from "./Details";
import { Carousel } from "./Carousel";
import ArrowButton from "./Buttons/ArrowButton";

export const Modal = ({ onClose, cardData }) => {
  console.log("card data here", cardData);

  return (
    <div className="info-card">
      <ArrowButton onClick={onClose} direction="back"/>

      <Carousel carouselImg={cardData?.carouselImg} />
      {/* carousel here */}
      {/* summary here */}
      <div></div>
      <Summary data={cardData} />
      {cardData.title}

      <div className="details">
        {/* details here */}
        <Details data={cardData} />
      </div>
    </div>
  );
};
