import React from "react";
import {FormattedMessage} from "react-intl";
import ReactGA from "react-ga";

export const ShareModal = ({ data, setShareModal }) => {
  const copyFunc = (data) => {
    ReactGA.event({
      category: 'Refill Spot',
      action: 'Clicked copy button',
      label: data.id,
    });
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
      <h3 className="share-modal-title"><FormattedMessage id="spot.share.title" /></h3>
      <div className="share-link">{data.title}</div>
      <div className="link-copy">
        <input className="link" type="text" disabled="disabled" value={data.action.share} />
        <button className="copy-button" onClick={() => copyFunc(data)}>
          <FormattedMessage id="spot.share.copy" />
        </button>
      </div>

      <button className="close-share-modal" onClick={closeFunc}>
        <img
          id="close"
          src="/public/images/close-button-small.svg"
          alt="Close"
          width="16"
          height="16"
        />
      </button>
    </div>
  );
};
