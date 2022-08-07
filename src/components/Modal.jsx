import React, { useEffect } from "react";
import { Summary } from "./Summary";
import { Details } from "./Details";
import { Carousel } from "./Carousel";
//import ArrowButton from "./Buttons/ArrowButton";
import BackButton from "./Buttons/BackButton";

export const Modal = ({ onClose, cardData }) => {

  useEffect(() => {
    function handleEscape(event){
      if (event.code === 'Escape'){
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="info-card">
      <BackButton onClick={onClose} id="back" className={"back-button"}/>

      <Carousel carouselImg={cardData?.carouselImg} />
      <div></div>
      <Summary data={cardData} />

      <div className="details">
        <Details data={cardData} />
      </div>
    </div>
  );
};
