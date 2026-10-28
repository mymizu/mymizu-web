import React, { useState } from "react";
import ArrowButton from "./Buttons/ArrowButton";
import classnames from "classnames";
import { PHOTO_SIZES, photoSrcSet, photoUrlForWidth } from "../utils/photoUrls";

// One spot photo, at the size the card draws it. If the sized url fails, it
// falls back once to the original url. Keyed by photo id by the caller, so
// that fallback is per photo.
const PhotoSlide = ({ photo }) => {
  const [useOriginal, setUseOriginal] = useState(false);
  const sized = !useOriginal && Boolean(photo.id);

  return (
    <img
      className="image-slide"
      // src only matters to a browser without srcset support.
      src={sized ? photoUrlForWidth(photo, 640) : photo.url}
      srcSet={sized ? photoSrcSet(photo) : undefined}
      sizes={sized ? PHOTO_SIZES : undefined}
      alt=""
      decoding="async"
      onError={() => sized && photo.url && setUseOriginal(true)}
    />
  );
};

export const Carousel = (props) => {
  const images = props?.carouselImg;
  const [currentIndex, setCurrentIndex] = useState(0);

  const previousSlide = () => {
    if (images && !images?.length) {
      return;
    }
    const lastIndex = images.length - 1;
    const shouldResetIndex = currentIndex === 0;
    const index = shouldResetIndex ? lastIndex : currentIndex - 1;

    setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (images && !images?.length) {
      return;
    }
    const lastIndex = images.length - 1;
    const shouldResetIndex = currentIndex === lastIndex;
    const index = shouldResetIndex ? 0 : currentIndex + 1;
    setCurrentIndex(index);
  };

  // The index can outlive a switch to a spot with fewer photos.
  const photo = images?.[currentIndex] || images?.[0];

  return (
    <div
      className={classnames("carousel", {
        ["carousel-slide-up"]: props.isSlideUp,
      })}
    >
      {images?.length > 1 && 
        <ArrowButton
          onClick={previousSlide}
          direction="back"
          className={"left-carousel-button"}
        />
      }
      {photo && 
        <PhotoSlide key={photo.id ?? photo.url} photo={photo} />
      }
      {images?.length < 1 && 
        <img
          className="image-slide"
          src="/public/images/mymizu_placeholder.png"
          alt=""
        />
      }
      {images?.length > 1 && 
        <ArrowButton
          onClick={nextSlide}
          direction="forward"
          className={"right-carousel-button"}
        />
      }


    </div>
  );
};