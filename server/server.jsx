import path from "path";
import fs from "fs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import express from "express";
import FormData from 'form-data';

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

app.get("/get-current-markers", async (req, res) => {
  const currentPos = {
    c1: parseFloat(req.query.c1),
    c2: parseFloat(req.query.c2),
    c3: parseFloat(req.query.c3),
    c4: parseFloat(req.query.c4)
  }

  try {
    const markers = await myMizuClient.get(
      "/api/taps/nearby",
      currentPos,
    );

    res.status(200).send(markers);
  } catch (e) {
    res.status(400).json({
      message: "Unable to fetch updated markers",
      error: e,
    });
  }
});

app.post("/filters-params", async (req, res) => {
  try {
    let { position, places } = req.query;
    position = JSON.parse(position);
    var data = new FormData();
    data.append('tags', places);
    data.append('categories', '4');
    data.append('c1', position.c1.toString());
    data.append('c2', position.c2.toString());
    data.append('c3', position.c3.toString());
    data.append('c4', position.c4.toString());
    const result = await myMizuClient.post(
      "/api/taps/search?api_key=56b13329-6163-4884-afc8-b6839cd3f618&l=en&v=1",
      data,
      {
        headers: {
          'Authorization': 'Bearer 80687679-180a-420d-9143-33c612d2f971',
          ...data.getHeaders()
        }
      },
    );
    console.log("Result: ", result);
    res.status(200).send(result.data);
  } catch (e) {
    res.status(400).json({
      message: "Unable to fetch updated markers",
      error: e,
    });
  }
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
