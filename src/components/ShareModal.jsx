import React,{ useState } from "react";
import {FormattedMessage, useIntl} from "react-intl";


export const ShareModal = ({ data, setShareModal, showCopyCheck, setShowCopyCheck }) => {
  const intl = useIntl()

  const copyFunc = (data) => {
    /*ReactGA.event({
      category: 'Refill Spot',
      action: 'Clicked copy button',
      label: data.id,
    });*/
    navigator.clipboard.writeText(data.action.share).then(() => {

      /*add code here that turns icon into check.png*/
      setShowCopyCheck(false);
      /* alert(intl.formatMessage({ id: 'copied' })); */

    }, () => {
      /* clipboard write failed */
    });

  };
  const closeFunc = () => {
    setShareModal(false);
  };

/*still need to figure out how to change tick back into 'copy' when link changes*/


  return (
    <div className="share-modal">
      <h3 className="share-modal-title"><FormattedMessage id="spot.share.title"/></h3>
      <div className="share-link">{data.title}</div>
      <div className="link-copy">
        <input className="link" type="text" disabled="disabled" value={data.action.share} />
        {
          showCopyCheck && <button className="copy-button" onClick={() => copyFunc(data)}>
            <FormattedMessage id="spot.share.copy" />
          </button>
        }
        {
          showCopyCheck || <img id="check_icon" src="/public/images/check.png" width="17" height="13"></img>
        }

        
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
