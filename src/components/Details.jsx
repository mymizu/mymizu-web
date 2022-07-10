import React from "react";
// import cup from '../../public/images/cup.svg';
// import clock from '../../public/images/clock.svg';
// import globe from '../../public/images/globe.svg';

export const Details = ({ data }) => {
    const commentArray = data.comment.split("\n");
    const refill = commentArray.indexOf("How to Refill:\r");
    const refillMethod = commentArray[refill + 1];
    console.log(refill);

    console.log("details", data)
  
    return (
    <div>
      <div>How to Refill {refillMethod}</div>
      <div dangerouslySetInnerHTML={{__html: refillMethod}}></div>
      <div>Link: {data.description.link}</div>
      <div>Address: {data.address}</div>
      <div>Report/Suggest change to details</div>
      <div>Feedback: {data.description.feedback}</div>
    </div>
  );
};
