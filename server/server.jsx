import path from "path";
import fs from "fs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import express from "express";

import config from "./config"
import { App } from "../src/App";
import { myMizuClient } from "./myMizuClient"

const PORT = process.env.PORT || 3000;
const gmapApiKey = config.gmApiKey;
const app = express();

app.get("/bundle.js", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../dist/bundle.js")
  );
});

app.use("/public", express.static(
  path.join(__dirname, "../public")
));



app.get("/get-initial-markers", async (req, res) => {
  const initialPos = {
    c1: 35.662,
    c2: 39.73655447363853,
    c3: 32.64245244856602,
    c4: 150.75432142615318,
  }


  try {
    const markers = await myMizuClient.get(
      "/api/taps/nearby",
      initialPos,
    );

    res.status(200).send(markers);
  } catch (e) {
    res.status(400).json({
      message: "Unable to fetch initial markers",
      error: e,
    });
  }
});

app.get("/refill_spots/:slug", (req, res) => {
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
        <div id="root">${ReactDOMServer.renderToString(<App gmApiKey={gmapApiKey} params={req.params} />)}</div>
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
        <div id="root">${ReactDOMServer.renderToString(<App gmApiKey={gmapApiKey} />)}</div>
        `
      )
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
