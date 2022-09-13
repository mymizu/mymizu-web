import React from "react";
import {FormattedMessage} from "react-intl";

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
      <a className="share-modal-title"><FormattedMessage id="spot.share.title" /></a>
      <div className="share-link">{data.title}</div>
      <div className="link-copy">
        <div>{data.action.share}</div>
        <button className="copy-button" onClick={() => copyFunc(data)}>
          <FormattedMessage id="spot.share.copy" />
        </button>
      </div>

      <button className="close-share-modal" onClick={closeFunc}>
        X
      </button>
    </div>
  );
};
