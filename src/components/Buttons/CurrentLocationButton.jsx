import React from "react";

const CurrentLocationButton = ({ onClick, className }) => {
  return (
    // <button id="current_location_button" onClick={onClick}>
      <img
        id="current_location_button"
        onClick={onClick}
        src="/public/images/Im_here.png" 
        alt=""
      />
    // </button>
  );
};

export default CurrentLocationButton;


//const CurrentLocationButton = ({ onClick, className, setResetClick,resetClick }) => {
    //return (
      //<button className={className} onClick={setResetClick(!resetClick)}>

      
//<CurrentLocationButton
//onClick={getGeolocation}
//className={"current-location-button"}
///>