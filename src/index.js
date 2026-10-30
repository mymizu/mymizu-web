import * as React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";
import { languageFromPath } from "./utils/languagePath";

const gmApiKey = window.__GM_API_KEY__
const gaTag = window.__GA_TAG__
// Stamped by the server so the hydrated tree matches what it rendered.
const coolingShelters = window.__COOLING_SHELTERS__ === true
// Read from the URL, as the server does, so both render the same language.
const initialLocale = languageFromPath(window.location.pathname)
// The spot a /refill/ page is about, which the server rendered open.
const initialSpot = window.__SPOT__ || null

ReactDOM.hydrate(
  <App
    gmApiKey={gmApiKey}
    gaTag={gaTag}
    coolingShelters={coolingShelters}
    initialLocale={initialLocale}
    initialSpot={initialSpot}
  />,
  document.getElementById("root")
);

