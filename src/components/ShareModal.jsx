import React, { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { photoUrlForWidth } from "../utils/photoUrls";

// Tap::COOLING_SHELTER_CATEGORY_ID (backend) = 6
const COOLING_SHELTER_CATEGORY_ID = 6;

// How long the Copy button says "Copied!" before going back to "Copy".
const COPIED_MS = 2000;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Icons from Bootstrap Icons 1.11 (MIT), inlined so the popup needs neither the
// icon font nor any third-party script. 16x16 viewBox, drawn in currentColor.
const ICONS = {
  share: (
    <>
      <path fillRule="evenodd" d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1z" />
      <path fillRule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 1.707V10.5a.5.5 0 0 1-1 0V1.707L5.354 3.854a.5.5 0 1 1-.708-.708z" />
    </>
  ),
  copy: (
    <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
  ),
  check: (
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
  ),
  close: (
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
  ),
  line: (
    <path d="M8 0c4.411 0 8 2.912 8 6.492 0 1.433-.555 2.723-1.715 3.994-1.678 1.932-5.431 4.285-6.285 4.645-.83.35-.734-.197-.696-.413l.003-.018.114-.685c.027-.204.055-.521-.026-.723-.09-.223-.444-.339-.704-.395C2.846 12.39 0 9.701 0 6.492 0 2.912 3.59 0 8 0M5.022 7.686H3.497V4.918a.156.156 0 0 0-.155-.156H2.78a.156.156 0 0 0-.156.156v3.486c0 .041.017.08.044.107v.001l.002.002.002.002a.15.15 0 0 0 .108.043h2.242c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157m.791-2.924a.156.156 0 0 0-.156.156v3.486c0 .086.07.155.156.155h.562c.086 0 .155-.07.155-.155V4.918a.156.156 0 0 0-.155-.156zm3.863 0a.156.156 0 0 0-.156.156v2.07L7.923 4.832l-.013-.015v-.001l-.01-.01-.003-.003-.011-.009h-.001L7.88 4.79l-.003-.002-.005-.003-.008-.005h-.002l-.003-.002-.01-.004-.004-.002-.01-.003h-.002l-.003-.001-.009-.002h-.006l-.003-.001h-.004l-.002-.001h-.574a.156.156 0 0 0-.156.155v3.486c0 .086.07.155.156.155h.56c.087 0 .157-.07.157-.155v-2.07l1.6 2.16a.2.2 0 0 0 .039.038l.001.001.01.006.004.002.008.004.007.003.005.002.01.003h.003a.2.2 0 0 0 .04.006h.56c.087 0 .157-.07.157-.155V4.918a.156.156 0 0 0-.156-.156zm3.815.717v-.56a.156.156 0 0 0-.155-.157h-2.242a.16.16 0 0 0-.108.044h-.001l-.001.002-.002.003a.16.16 0 0 0-.044.107v3.486c0 .041.017.08.044.107l.002.003.002.002a.16.16 0 0 0 .108.043h2.242c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157H11.81v-.589h1.525c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157H11.81v-.589h1.525c.086 0 .155-.07.155-.156Z" />
  ),
  x: (
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
  ),
  facebook: (
    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
  ),
  email: (
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
  ),
};

const Icon = ({ name, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    {ICONS[name]}
  </svg>
);

// Plain links to each service's own share page: no SDKs, no third-party
// scripts, nothing loaded until someone taps one.
const shareTargets = ({ url, text, subject }) => {
  const u = encodeURIComponent(url);
  return [
    {
      id: "line",
      label: "LINE",
      href: `https://social-plugins.line.me/lineit/share?url=${u}`,
    },
    {
      id: "x",
      label: "X",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${u}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    {
      id: "email",
      href: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    },
  ];
};

// A small picture of the spot, or its map pin when it has no photo (or the
// photo fails to load).
const Thumbnail = ({ data }) => {
  const photo = data.carouselImg?.[0];
  const sized = photo ? photoUrlForWidth(photo, 320) : null;
  const [src, setSrc] = useState(sized || null);

  if (!src) {
    const pin =
      data.categoryId === COOLING_SHELTER_CATEGORY_ID
        ? "/public/images/map-shelter.svg"
        : data.categoryId === 4
          ? "/public/images/map-pin-gold.svg"
          : "/public/images/map-pin.svg";
    return (
      <div className="share-modal-thumb share-modal-thumb-pin">
        <img src={pin} alt="" width="24" height="32" />
      </div>
    );
  }

  // If the resized photo fails, try the original once, then the pin.
  const onError = () =>
    setSrc(src === sized && photo.url && photo.url !== sized ? photo.url : null);

  return (
    <img
      className="share-modal-thumb"
      src={src}
      alt=""
      width="56"
      height="56"
      onError={onError}
    />
  );
};

export const ShareModal = ({ data, onClose }) => {
  const intl = useIntl();
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const primaryRef = useRef(null);
  const backdropPressRef = useRef(false);
  const copiedTimerRef = useRef(null);
  // "idle" | "copied" | "failed"
  const [copyState, setCopyState] = useState("idle");
  // Only ever rendered in the browser (the popup starts closed), so reading
  // navigator here can't disagree with the server's HTML.
  const [canNativeShare] = useState(
    () => typeof navigator !== "undefined" && typeof navigator.share === "function"
  );

  const url = data.action.share;
  const isShelter = data.categoryId === COOLING_SHELTER_CATEGORY_ID;
  const text = intl.formatMessage(
    { id: isShelter ? "spot.share.text.shelter" : "spot.share.text" },
    { name: data.title }
  );
  const subject = `${data.title} | mymizu`;
  const titleId = `share-modal-title-${data.id}`;
  const linkId = `share-modal-link-${data.id}`;

  // Focus moves into the popup when it opens and back to whatever opened it
  // (the Share button) when it closes. Escape closes just the popup: the
  // listener runs in the capture phase and stops the event, so the card's own
  // Escape handler underneath doesn't close the whole spot as well. Tab is
  // kept inside the popup while it is open.
  useEffect(() => {
    const opener = document.activeElement;
    primaryRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const focusable = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      if (!focusable.length) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const inside = dialogRef.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      clearTimeout(copiedTimerRef.current);
      // Safari doesn't focus a button on click, so the opener can be <body>.
      const target =
        opener && opener !== document.body && document.contains(opener)
          ? opener
          : document.querySelector(".share-button");
      target?.focus?.();
    };
  }, []);

  const selectLink = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.focus();
    input.setSelectionRange(0, input.value.length);
  };

  const showCopied = () => {
    setCopyState("copied");
    clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopyState("idle"), COPIED_MS);
  };

  // The async Clipboard API needs a secure context and permission, so fall
  // back to selecting the link and the older execCommand copy. If that fails
  // too, the link is left selected for the visitor to copy by hand.
  const copyFallback = () => {
    selectLink();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    if (copied) {
      showCopied();
    } else {
      setCopyState("failed");
    }
  };

  const copyFunc = () => {
    /*ReactGA.event({
      category: 'Refill Spot',
      action: 'Clicked copy button',
      label: data.id,
    });*/
    if (!navigator.clipboard?.writeText) {
      copyFallback();
      return;
    }
    navigator.clipboard.writeText(url).then(showCopied, copyFallback);
  };

  const nativeShare = () => {
    /*ReactGA.event({
      category: 'Refill Spot',
      action: 'Clicked native share button',
      label: data.id,
    });*/
    navigator.share({ title: subject, text, url }).catch((error) => {
      // AbortError is the visitor closing the share sheet: nothing to do.
      if (error?.name !== "AbortError") {
        selectLink();
      }
    });
  };

  const onBackdropMouseDown = (event) => {
    backdropPressRef.current = event.target === event.currentTarget;
  };

  // Only a press that starts and ends on the backdrop closes the popup, so
  // dragging to select the link and letting go outside it doesn't.
  const onBackdropClick = (event) => {
    if (backdropPressRef.current && event.target === event.currentTarget) {
      onClose();
    }
    backdropPressRef.current = false;
  };

  const copied = copyState === "copied";

  return (
    <div
      className="share-modal-backdrop"
      onMouseDown={onBackdropMouseDown}
      onClick={onBackdropClick}
    >
      <div
        ref={dialogRef}
        className="share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="share-modal-header">
          <h2 className="share-modal-title" id={titleId}>
            <FormattedMessage
              id={isShelter ? "spot.share.title.shelter" : "spot.share.title"}
            />
          </h2>
          <button
            type="button"
            className="share-modal-close"
            onClick={onClose}
            aria-label={intl.formatMessage({ id: "spot.share.close" })}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="share-modal-spot">
          <Thumbnail key={data.id} data={data} />
          <div className="share-modal-spot-text">
            <div className="share-modal-spot-name">{data.title}</div>
            <div className="share-modal-spot-host">map.mymizu.co</div>
          </div>
        </div>

        {canNativeShare && (
          <button
            type="button"
            ref={primaryRef}
            className="share-modal-native"
            onClick={nativeShare}
          >
            <Icon name="share" size={18} />
            <FormattedMessage id="spot.share.native" />
          </button>
        )}

        <ul className="share-modal-targets">
          {shareTargets({ url, text, subject }).map((target) => (
            <li key={target.id}>
              <a
                className={`share-modal-target share-modal-target-${target.id}`}
                href={target.href}
                target={target.id === "email" ? undefined : "_blank"}
                rel={target.id === "email" ? undefined : "noopener noreferrer"}
                aria-label={intl.formatMessage({ id: `spot.share.${target.id}` })}
              >
                <span className="share-modal-target-icon">
                  <Icon name={target.id} size={22} />
                </span>
                <span className="share-modal-target-label">
                  {target.label || intl.formatMessage({ id: "spot.share.email.short" })}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <label className="share-modal-link-label" htmlFor={linkId}>
          <FormattedMessage id="spot.share.link" />
        </label>
        <div className="share-modal-link">
          <input
            ref={inputRef}
            id={linkId}
            className="share-modal-link-input"
            type="text"
            readOnly
            value={url}
            onFocus={selectLink}
            onClick={selectLink}
          />
          <button
            type="button"
            ref={canNativeShare ? undefined : primaryRef}
            className={`share-modal-copy${copied ? " share-modal-copy-done" : ""}`}
            onClick={copyFunc}
          >
            <Icon name={copied ? "check" : "copy"} size={16} />
            {/* Both labels share one grid cell, so the button is always as
                wide as the longer one and doesn't jump when it changes. */}
            <span className="share-modal-copy-label">
              <span className={copied ? "share-modal-copy-off" : undefined}>
                <FormattedMessage id="spot.share.copy" />
              </span>
              <span className={copied ? undefined : "share-modal-copy-off"}>
                <FormattedMessage id="spot.share.copied" />
              </span>
            </span>
          </button>
        </div>
        <p className="share-modal-status" role="status">
          {copied && (
            <span className="visually-hidden">
              <FormattedMessage id="spot.share.copied.announce" />
            </span>
          )}
          {copyState === "failed" && (
            <span className="share-modal-error">
              <FormattedMessage id="spot.share.copyFailed" />
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
