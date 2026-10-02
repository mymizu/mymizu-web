import * as React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";

const gmApiKey = window.__GM_API_KEY__
const gaTag = window.__GA_TAG__
// Stamped by the server so the hydrated tree matches what it rendered.
const coolingShelters = window.__COOLING_SHELTERS__ === true

ReactDOM.hydrate(
  <App gmApiKey={gmApiKey} gaTag={gaTag} coolingShelters={coolingShelters} />,
  document.getElementById("root")
);

