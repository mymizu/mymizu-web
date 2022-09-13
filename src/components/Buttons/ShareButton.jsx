import React from "react";
import {FormattedMessage} from "react-intl";

export const ShareButton = ({ setShareModal, shareModal }) => {
  return (
    <button className="share-button" onClick={() => setShareModal(!shareModal)}>
      シェア
    </button>
  );
};
