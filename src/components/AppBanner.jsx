import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

// "Get the app" for Android visitors: Android's counterpart to the
// apple-itunes-app meta tag in public/index.html, which gives iPhones the App
// Clip card and Safari's banner. With the app installed, App Links
// (/.well-known/assetlinks.json) open refill links in it directly, so this is
// seen by people without it, or in an in-app browser that ignores App Links.

const PLAY_PACKAGE = "co.mymizu.mymizu";

// Dismissing hides it for this long.
const DISMISSED_AT_KEY = "appBannerDismissedAt";
const DISMISS_MS = 30 * 24 * 60 * 60 * 1000;

// Android only: iPhones have Apple's banner, and desktops can't install it.
// (No iOS browser says "Android", and Windows Phone's does.)
const isAndroid = () => {
  if (typeof navigator === "undefined") return false;
  if (navigator.userAgentData?.platform === "Android") return true;
  const ua = navigator.userAgent || "";
  return /Android/i.test(ua) && !/Windows Phone/i.test(ua);
};

// Storage can throw (blocked cookies, some private modes); then the banner
// shows, and a dismissal lasts until the page is reloaded.
const dismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISSED_AT_KEY));
    return at > 0 && Date.now() - at < DISMISS_MS;
  } catch {
    return false;
  }
};

const rememberDismissal = () => {
  try {
    localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // See dismissedRecently.
  }
};

// The Play Store passes `referrer` to the app on its first launch (Install
// Referrer API), so installs can be traced to this banner, and to the spot
// the visitor was looking at. The app doesn't read it yet; it could use the
// slug to open that spot after installing.
export const playStoreUrl = (slug) => {
  const referrer = [
    "utm_source=map.mymizu.co",
    "utm_medium=android_banner",
    slug ? `utm_content=${slug}` : null,
  ]
    .filter(Boolean)
    .join("&");
  return `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}&referrer=${encodeURIComponent(
    referrer
  )}`;
};

// slug: the refill spot open on the page, if any.
export const AppBanner = ({ slug }) => {
  const intl = useIntl();
  // Decided in the browser: the server renders without it, so hydration
  // matches, and it appears once the page has loaded.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isAndroid() && !dismissedRecently()) setShow(true);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    rememberDismissal();
    setShow(false);
    // The close button had focus and is going away; carry on from the next
    // thing in the header rather than dropping focus to the top of the page.
    document.querySelector(".logo-link")?.focus();
  };

  return (
    <aside
      className="app-banner"
      aria-label={intl.formatMessage({ id: "appBanner.label" })}
    >
      <img
        className="app-banner-icon"
        src="/public/android-chrome-192x192.png"
        alt=""
        width="40"
        height="40"
      />
      <div className="app-banner-text">
        <p className="app-banner-title">mymizu</p>
        <p className="app-banner-subtitle">
          <FormattedMessage id="appBanner.text" />
        </p>
      </div>
      <a
        className="app-banner-get"
        href={playStoreUrl(slug)}
        aria-label={intl.formatMessage({ id: "appBanner.getLabel" })}
      >
        <FormattedMessage id="appBanner.get" />
      </a>
      <button
        type="button"
        className="app-banner-close"
        aria-label={intl.formatMessage({ id: "appBanner.close" })}
        onClick={dismiss}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
        </svg>
      </button>
    </aside>
  );
};
