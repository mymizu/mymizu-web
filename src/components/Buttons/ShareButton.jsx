import React from "react";

export const ShareButton = ({ setShareModal, shareModal }) => {
  return (
    <button className="share-button" onClick={() => setShareModal(!shareModal)}>
      シェア
    </button>
  );
};
