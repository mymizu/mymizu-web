import * as React from "react";
import ReactDOM from "react-dom";


import { App } from "./App";


let gmApiKey = window.__GM_API_KEY__
if (!gmApiKey) {
gmApiKey = process.env.REACT_APP_GM_API_KEY
}
const gaTag = window.__GA_TAG__
ReactDOM.hydrate(<App gmApiKey={gmApiKey} gaTag={gaTag} />, document.getElementById("root"));

