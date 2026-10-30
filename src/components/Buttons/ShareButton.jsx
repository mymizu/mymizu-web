import React from "react";
import {FormattedMessage} from "react-intl";

export const ShareButton = ({ setShareModal, id }) => {

  const onClickShare = () => {
    /*ReactGA.event({
      category: 'Refill Spot',
      action: 'Clicked share button',
      label: id,
    });*/
    setShareModal(true)
  }
  return (
    <button
      type="button"
      className="share-button"
      aria-haspopup="dialog"
      onClick={() => onClickShare()}
    >
      <FormattedMessage id="spot.share" />
    </button>
  );
};