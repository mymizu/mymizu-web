import React, { useEffect, useState } from "react";
import { Summary } from "./Summary";
import { Details } from "./Details";
import { Carousel } from "./Carousel";
import BackButton from "./Buttons/BackButton";
import { checkViewPort } from "../helpers";
import classnames from "classnames";

export const Modal = ({ onClose, cardData, isSlideUp, setIsSlideUp, setShareModal }) => {
  const { group } = checkViewPort();

  const showDetails = () => {
    if (group.title === "mobile") {
      setIsSlideUp(true);
    }
  };

  useEffect(() => {
    function handleEscape(event) {
      if (event.code === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
  }, []);

  return (
    <div
      className={classnames("info-card", { ["info-card-slide-up"]: isSlideUp })}
      onClick={() => showDetails()}
    >
      <BackButton onClick={onClose} id="back" className={"back-button"} />

      <Carousel carouselImg={cardData?.carouselImg} isSlideUp={isSlideUp} />
      <div></div>
      <Summary data={cardData} setShareModal={setShareModal} />

      <div
        className={classnames("details", {
          ["details-slide-up"]: isSlideUp,
        })}
      >
        <Details data={cardData} />
      </div>
    </div>
  );
};
