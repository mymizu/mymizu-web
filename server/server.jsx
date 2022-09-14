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

app.get("/get-initial-markers", async (req, res) => {
  const initialPos = {
    c1: 35.662,
    c2: 39.73655447363853,
    c3: 32.64245244856602,
    c4: 150.75432142615318,
  };

  try {
    const markers = await myMizuClient(getToken(req), getLanguage(req)).get("/api/taps/nearby", initialPos);

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

    const markers = await myMizuClient(getToken(req), getLanguage(req)).get("/api/taps/nearby", pos);

    res.status(200).send(markers);
  } catch (e) {
    res.status(400).json({
      message: "Unable to fetch initial markers",
      error: e,
    });
  }
});

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
        <div id="root">${ReactDOMServer.renderToString(
          <App gmApiKey={gmapApiKey}/>
        )}</div>
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
        <div id="root">${ReactDOMServer.renderToString(
          <App gmApiKey={gmapApiKey}/>
        )}</div>
        `
      )
    );
  });
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

    const markers = await myMizuClient(getToken(req), getLanguage(req)).get("/api/taps/nearby", pos);

    res.status(200).send(markers);
  } catch (e) {
    res.status(400).json({
      message: "Unable to fetch initial markers",
      error: e,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
