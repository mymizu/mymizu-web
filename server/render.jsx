import React from "react";
import { renderToString } from "react-dom/server";

import { App } from "../src/App";
import config from "./config";

const gmapApiKey = config.gmApiKey;

// TODO: revise copy and image asset for this map application
// TODO: i18n implementation for platforms that support it, e.g. Facebook
const baseUrl = "https://map.mymizu.co";
const data = {
  name: 'mymizu',
  url: baseUrl,
  title: "mymizu 日本初給水アプリ refill app and sustainability movement",
  description:
    "mymizuは、人々の消費行動を持続不可能なものから環境に責任を持つものに変えることをミッションとしています。日本初無料給水アプリを始め、マイボトルや給水の促進やイベント、教育活動、企業との協同事業、コンサルティングなどを通して、楽しく、持続可能なライフスタイルを実現できる世界を創っていきます。At mymizu, we’re on a mission to change everyday consumer behaviour, from unsustainable to environmentally responsible! From our free refill app to our online store, together, we’re building a world in which sustainable living is easy and fun!",
  image: {
    url: `${baseUrl}/images/meta.jpg`,
    width: "1155",
    height: "656",
  },
};
const meta = `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${data.name}</title>

  <meta property="og:site_name" content="${data.name}">
  <meta property="og:type" content="website">
  <meta property="og:url" content=${data.url}>
  <meta property="og:title" content=${data.title}>
  <meta property="og:description" content=${data.description}>
  <meta property="og:image" content=${data.image.url}>
  <meta property="og:image:width" content=${data.image.width}>
  <meta property="og:image:height" content=${data.image.height}>

  <meta itemProp="url" content=${data.url}>
  <meta itemProp="name" content=${data.title}>
  <meta name="description" content=${data.description}>
  <meta itemProp="description" content=${data.description}>
  <meta itemProp="thumbnailUrl" content=${data.image.url}>
  <link rel="image_src" href=${data.image.url}>
  <meta itemProp="image" content=${data.image.url}>

  <meta name="twitter:card" content="summary">
  <meta name="twitter:url" content=${data.url}>
  <meta name="twitter:title" content=${data.title}>
  <meta name="twitter:description" content=${data.description}>
  <meta name="twitter:image" content=${data.image.url}>
  `;

const dynamicContent = (template) => {
  const root = renderToString(<App gmApiKey={gmapApiKey} />);
  const body = `
    <script>window.__GM_API_KEY__=${JSON.stringify(gmapApiKey)}</script>
    <div id="root">${root}</div>
  `;

  return template
    .replace("<meta>", meta)
    .replace('<div id="root"></div>', body);
};
export default {
  dynamicContent,
};
