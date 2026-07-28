import path from "path";
import fs from "fs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import express from "express";

import config from "./config";
import {App} from "../src/App";
import {myMizuClient} from "./myMizuClient";
import i18nConfig from "../src/i18nConfig";

const PORT = process.env.PORT || 3000;
const gmapApiKey = config.gmApiKey;
const gaTag = config.gaTag;
const app = express();
const crypto = require('crypto');

const getLanguage = (req) => {
  const lang = req.acceptsLanguages("en", "ja");
  if (lang) {
    return lang;
  }
  return "en";
};


const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};


app.get("/bundle.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/bundle.js"));
});

app.use("/public", express.static(path.join(__dirname, "../public")));

app.get("/api/authorize", async (req, res) => {
  const params = {
    l: getLanguage(req),
    platform: 'web',
    client_version: '1.0',
    client_build: '100',
    uuid: crypto.randomUUID(),
  };

  try {
    const token = await myMizuClient(null, null).get("/api/start", params);

    res.status(200).send(token);
  } catch (e) {
    res.status(400).json({
      message: "Unable to complete authorization",
      error: e,
    });
  }
});

const INITIAL_POSITION = {
  c1: 35.662,
  c2: 39.73655447363853,
  c3: 32.64245244856602,
  c4: 150.75432142615318,
};

const TAP_FETCH_OPTIONS = {
  include_cooling_shelters: true,
};

app.get("/get-initial-markers", async (req, res) => {
  try {
    const markers = await myMizuClient(getToken(req), getLanguage(req)).get("/api/taps/nearby", {
      ...INITIAL_POSITION,
      ...TAP_FETCH_OPTIONS,
    });

    res.status(200).send(markers);
  } catch (e) {
    res.status(400).json({
      message: "Unable to fetch initial markers",
      error: e,
    });
  }
});

app.get("/community", async (req, res) => {
  try {
    const data = await myMizuClient(getToken(req), getLanguage(req)).get("/api/community");
    res.status(200).send(data);
  } catch (error) {
    res.status(400).json({
      message: "Unable to fetch community",
      error,
    });
  }
});

app.get("/get-marker-moving-map?", async (req, res) => {
  try {
    const {c1, c2, c3, c4} = req.query;

    const pos = {
      c1,
      c2,
      c3,
      c4,
    };

    const markers = await myMizuClient(getToken(req), getLanguage(req)).get("/api/taps/nearby", {
      ...pos,
      ...TAP_FETCH_OPTIONS,
    });

    res.status(200).send(markers);
  } catch (e) {
    res.status(400).json({
      message: "Unable to fetch initial markers",
      error: e,
    });
  }
});

// Feature: Not working yet, error on server side, but we can use this to fetch all clusters and cache them on the client side
app.get("/get-clusters", async (req, res) => {
  try {
    const ifNoneMatch = req.headers["if-none-match"];

    const upstream = await myMizuClient(getToken(req), getLanguage(req)).getRaw(
      "/api/taps/clusters/all",
      {},
      {
        headers: ifNoneMatch ? { "If-None-Match": ifNoneMatch } : {},
        validateStatus: (status) => status === 200 || status === 304,
      }
    );

    if (upstream.headers["etag"]) {
      res.set("ETag", upstream.headers["etag"]);
    }
    res.set(
      "Cache-Control",
      upstream.headers["cache-control"] || "public, max-age=3600"
    );

    if (upstream.status === 304) {
      res.status(304).end();
      return;
    }

    res.set("Content-Type", "application/json");
    res.status(200).send(upstream.data);
  } catch (e) {
    const status = e.response?.status || 502;
    const upstreamBody = e.response?.data;

    res.status(status).json({
      message: "Unable to fetch clusters",
      error: upstreamBody ?? e.message,
    });
  }
});

//*

app.get("/get-refill-spot/:slug", async (req, res) => {
  try {
    const info = await myMizuClient(getToken(req), getLanguage(req)).get(`/api/taps/${req.params.slug}/`);
    res.status(200).send(info);
  } catch (e) {
    res.status(400).json({
      message: "Unable to fetch refill spot",
      error: e,
    });
  }
});

app.get("/refill/:language/:slug", (req, res) => {
  fs.readFile(path.resolve("./public/index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }
    // @NOTE:
    // You can inject SEO headers to the <head> tag as well
    return res.send(
      // @TODO:
      // You can turn this into a function on a different file
      data.replace(
        '<div id="root"></div>',
        `
        <script>window.__GM_API_KEY__=${JSON.stringify(gmapApiKey)}</script>
        <script>window.__GA_TAG__=${JSON.stringify(gaTag)}</script>
        <div id="root">${ReactDOMServer.renderToString(
          <App gmApiKey={gmapApiKey} gaTag={gaTag}/>
        )}</div>
        `
      ).replace(
        '<div id="ga"></div>',
        `
        <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaTag}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${gaTag}');
</script>
        `
      )
    );
  });
});

app.get("/", (req, res) => {
  fs.readFile(path.resolve("./public/index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }

    // @NOTE:
    // You can inject SEO headers to the <head> tag as well
    return res.send(
      // @TODO:
      // You can turn this into a function on a different file
      data.replace(
        '<div id="root"></div>',
        `
        <script>window.__GM_API_KEY__=${JSON.stringify(gmapApiKey)}</script>
                <script>window.__GA_TAG__=${JSON.stringify(gaTag)}</script>
        <div id="root">${ReactDOMServer.renderToString(
          <App gmApiKey={gmapApiKey} gaTag={gaTag}/>
        )}</div>
        `
      ).replace(
        '<div id="ga"></div>',
        `
        <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaTag}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${gaTag}');
</script>
        `
      )

    );
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
