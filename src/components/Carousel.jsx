import React, { useState } from "react";
import ArrowButton from "./Buttons/ArrowButton";
import classnames from "classnames";

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

  const ImageSlide = ({ url }) => {
    const styles = {
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      WbackgroundPosition: "center",
    };

    return <div className="image-slide" style={styles}></div>;
  };

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
      <ImageSlide url={images?.[currentIndex]?.url} />
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
