import path from "path";
import fs from "fs";
import express from "express";

import { myMizuClient } from "./myMizuClient"
import render from "./render";

const PORT = process.env.PORT || 3000;
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

app.get("/", (req, res) => {
  fs.readFile(path.resolve("./public/index.html"), "utf8", (err, template) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }
    return res.send(render.dynamicContent(template));
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
