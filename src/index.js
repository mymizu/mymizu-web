import * as React from "react";
import ReactDOM from "react-dom";
import ReactGA from 'react-ga';
import { App } from "./App";

const gmApiKey = window.__GM_API_KEY__
ReactDOM.hydrate(<App gmApiKey={gmApiKey} />, document.getElementById("root"));

const gaTag = window.__GA_TAG
ReactGA.initialize(gaTag);
