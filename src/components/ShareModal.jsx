import React from "react";

export const ShareModal = ({ data, setShareModal }) => {
  const copyFunc = (data) => {
    navigator.clipboard.writeText(data.action.share).then(() => {
      alert("Copied");
    }, () => {
      /* clipboard write failed */
    });

  };
  const closeFunc = () => {
    setShareModal(false);
  };
  return (
    <div className="share-modal">
      <a className="share-modal-title">Share this Refill spot</a>
      <div className="share-link">{data.title}</div>
      <div className="link-copy">
        <div>{data.action.share}</div>
        <button className="copy-button" onClick={() => copyFunc(data)}>
          Copy
        </button>
      </div>

      <button className="close-share-modal" onClick={closeFunc}>
        X
      </button>
    </div>
  );
};
