import * as React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";
// process.env('GM_API_KEY')

const gmApiKey = window.__GM_API_KEY__
const gaTag = window.__GA_TAG__
ReactDOM.hydrate(<App gmApiKey={gmApiKey} gaTag={gaTag} />, document.getElementById("root"));

