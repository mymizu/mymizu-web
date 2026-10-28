import React, { useEffect } from "react";
import { Summary, SPOT_TITLE_ID } from "./Summary";
import { Details } from "./Details";
import { Carousel } from "./Carousel";
import BackButton from "./Buttons/BackButton";
import { checkViewPort } from "../helpers";
import classnames from "classnames";

// focusOnOpen: move focus to the card's heading when it opens or shows a
// different spot, so keyboard and screen reader users land in it. Set when a
// spot is opened from the map; a card that opens with the page leaves focus
// where the browser puts it.
export const Modal = ({ onClose, cardData, isSlideUp, setIsSlideUp, setShareModal, focusOnOpen }) => {
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
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (focusOnOpen) {
      document.getElementById(SPOT_TITLE_ID)?.focus({ preventScroll: true });
    }
  }, [cardData?.id]);

  return (
    <section
      className={classnames("info-card", { ["info-card-slide-up"]: isSlideUp })}
      aria-labelledby={SPOT_TITLE_ID}
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
    </section>
  );
};
