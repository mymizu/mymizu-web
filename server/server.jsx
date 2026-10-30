import path from "path";
import fs from "fs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import express from "express";
import axios from "axios";

import config, { coolingSheltersEnabled } from "./config";
import {App} from "../src/App";
import {myMizuClient} from "./myMizuClient";
import { MYMIZU_API_BASE_URL } from "../src/constants";
import { PHOTO_SIZES, photoSrcSet, photoUrlForWidth } from "../src/utils/photoUrls";
import i18nConfig from "../src/i18nConfig";
import {buildRobotsTxt, getSitemap, isSitemapConfigured} from "./sitemap";
import {homeMeta, isLanguage, metaForSpot, renderMetaTags, spotFallbackMeta} from "./meta";

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


// Every asset was previously served with Express's default
// `Cache-Control: public, max-age=0`, so each repeat visit spent a revalidation
// round trip per asset. On mobile latency that is a large share of a repeat
// view. The bundle is now addressed by content hash so it can be cached hard
// and still change instantly on deploy.
const DIST_BUNDLE = path.join(__dirname, "../dist/bundle.js");
const HASHED_BUNDLE_RE = /^\/bundle\.[0-9a-f]{12}\.js$/;

// Set only by `yarn dev` (scripts/dev.js), never in production. It turns on the
// browser live-reload hook below and re-hashes the bundle on each page load,
// since in dev the client bundle is rebuilt without restarting this server.
const LIVE_RELOAD_PORT = process.env.LIVE_RELOAD_PORT;

let bundleHash = null;
const getBundleHash = () => {
  if (bundleHash && !LIVE_RELOAD_PORT) return bundleHash;
  try {
    bundleHash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(DIST_BUNDLE))
      .digest("hex")
      .slice(0, 12);
  } catch (e) {
    // Server started before the client build finished. Fall back to the
    // unhashed URL rather than failing the page.
    console.warn("Could not hash bundle.js; serving it unhashed:", e.message);
    bundleHash = null;
  }
  return bundleHash;
};

const bundleUrl = () => {
  const hash = getBundleHash();
  return hash ? `/bundle.${hash}.js` : "/bundle.js";
};

// Content-addressed: the URL changes whenever the bundle does, so this can be
// cached indefinitely.
app.get(HASHED_BUNDLE_RE, (req, res) => {
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile(DIST_BUNDLE);
});

// Kept for any client holding the old URL, and as the fallback when hashing
// failed. Must revalidate, since this path's contents change on every deploy.
app.get("/bundle.js", (req, res) => {
  res.set("Cache-Control", "public, max-age=0, must-revalidate");
  res.sendFile(DIST_BUNDLE);
});

app.use(
  "/public",
  express.static(path.join(__dirname, "../public"), {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Images and fonts are replaced in place occasionally (the cooling
      // shelter pins were), so a week rather than a year: long enough to skip
      // the revalidation round trips, short enough that a swapped-in asset
      // still lands without a rename.
      const longLived = /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/i;
      // public/vendor/<name>-<version>/ never changes in place: a new version
      // is a new directory.
      const versioned = /[\\/]vendor[\\/][^\\/]+-\d[^\\/]*[\\/]/;
      res.setHeader(
        "Cache-Control",
        versioned.test(filePath)
          ? "public, max-age=31536000, immutable"
          : longLived.test(filePath)
            ? "public, max-age=604800"
            : "public, max-age=3600"
      );
    },
  })
);

app.get("/.well-known/apple-app-site-association", (req, res) => {
  res.type("application/json");
  res.sendFile(
    path.join(__dirname, "../public/.well-known/apple-app-site-association")
  );
});

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.type("application/json");
  res.sendFile(path.join(__dirname, "../public/.well-known/assetlinks.json"));
});

// --- Icons ------------------------------------------------------------------
// iOS (the share sheet's link preview, Add to Home Screen) and many crawlers
// ask for these at the site root without reading the page's <link> tags, so
// serve them there as well as under /public.
const ROOT_ICONS = {
  "/favicon.ico": "favicon.ico",
  "/apple-touch-icon.png": "apple-touch-icon.png",
  "/apple-touch-icon-precomposed.png": "apple-touch-icon.png",
  "/site.webmanifest": "site.webmanifest",
};

Object.entries(ROOT_ICONS).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.set("Cache-Control", "public, max-age=604800");
    if (file.endsWith(".webmanifest")) res.type("application/manifest+json");
    res.sendFile(path.join(__dirname, "../public", file));
  });
});

// --- SEO: robots + sitemaps -------------------------------------------------
// These must live at the site root. Static assets are mounted under /public, so
// a file dropped in public/ would only be reachable at /public/robots.txt, which
// no crawler looks for.
//
// The sitemap itself is generated by the API (php artisan mymizu:generate-sitemap)
// and uploaded to the cloud disk; we proxy it so it is served from the same
// origin as the URLs it lists. Point SITEMAP_SOURCE at that bucket path.

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(buildRobotsTxt());
});

const sendSitemap = async (res, name) => {
  if (!isSitemapConfigured()) {
    console.error("SITEMAP_SOURCE is not set; cannot serve", name);
    return res.status(503).type("text/plain").send("Sitemap not configured");
  }

  try {
    const body = await getSitemap(name);
    res.type("application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    return res.send(body);
  } catch (error) {
    if (error.notFound) {
      return res.status(404).type("text/plain").send("Not found");
    }
    console.error(`Unable to serve ${name}:`, error.message);
    res.set("Retry-After", "600");
    return res
      .status(503)
      .type("text/plain")
      .send("Sitemap temporarily unavailable");
  }
};

app.get("/sitemap.xml", (req, res) => sendSitemap(res, "sitemap.xml"));

app.get("/sitemap-spots-:page.xml", (req, res) =>
  sendSitemap(res, `sitemap-spots-${req.params.page}.xml`),
);
// --- end SEO ----------------------------------------------------------------


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

// With the flag off the API leaves cooling shelters out of every tap response,
// so the layer disappears at the source rather than being filtered out further
// down — nothing to hide in the map, the search or the detail pages.
const TAP_FETCH_OPTIONS = {
  include_cooling_shelters: coolingSheltersEnabled,
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

    // The API's public, edge-cached copy (MyMizu#202): the same dataset and
    // ETag for everyone, so no token, key or query string (it refuses one).
    // The browser normally reads it there itself (src/utils/publicApi.js);
    // this is the way round when it can't.
    const upstream = await axios.get(
      `${MYMIZU_API_BASE_URL}/api/public/v1/clusters/all`,
      {
        timeout: 50000,
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

// Dev only: reload the page whenever scripts/dev.js reports a rebuild.
const liveReloadScript = LIVE_RELOAD_PORT
  ? `<script>(function(){var es=new EventSource(location.protocol+"//"+location.hostname+":${Number(
      LIVE_RELOAD_PORT
    )}/livereload");es.addEventListener("reload",function(){location.reload();});})();</script>`
  : "";

// Both HTML routes render the same shell; this is the shared implementation the
// duplicated copies used to ask for in a TODO. It also rewrites the bundle tag
// to the content-hashed URL so the immutable caching above actually applies.
// Everything between the markers in public/index.html is the head's meta block.
// Swapping the whole block keeps the static file self-contained (it carries the
// defaults) while letting each request substitute its own.
const META_BLOCK_RE = /[ \t]*<!-- head:meta[\s\S]*?\/head:meta -->/;

// The language a page with no language in its URL is rendered in, before the
// browser switches it to the visitor's. Its title and description are in the
// same language, so the head never describes a page the body does not match.
const DEFAULT_LOCALE = "ja";

// `locale` is the language the page body is rendered in. A refill spot URL
// names one, and Google indexes that body under the URL's title and
// description, so /refill/en/... must not come back with a Japanese nav and
// footer. Pages with no language in the URL keep rendering Japanese.
// JSON in a <script>: "<" is escaped so no value can close the tag, and
// U+2028/U+2029 because they end a line in older JS parsers.
const scriptJson = (value) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// On a refill spot page the photo in the spot card is the largest paint. The
// browser would only find it after the bundle has run and the card rendered,
// so the first photo is preloaded from the head with the card's own srcset and
// sizes (the browser then picks the same file the <img> will ask for), and the
// connection to the bucket the photo routes redirect to is opened early.
const spotHead = (spot) => {
  const photo = Array.isArray(spot?.photos) ? spot.photos[0] : null;
  if (!photo) return "";
  if (!photo.id) {
    return `  <link rel="preload" as="image" href="${escapeAttr(photo.url)}">\n`;
  }
  return `  <link rel="preconnect" href="https://mymizu-static.s3-ap-northeast-1.amazonaws.com">
  <link rel="preload" as="image" href="${escapeAttr(photoUrlForWidth(photo, 640))}" imagesrcset="${escapeAttr(
    photoSrcSet(photo)
  )}" imagesizes="${escapeAttr(PHOTO_SIZES)}">\n`;
};

const renderPage = (res, meta, locale = DEFAULT_LOCALE) => {
  fs.readFile(path.resolve("./public/index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }

    const html = data
      .replace("<html>", `<html lang="${locale}">`)
      // A function, not a string: spot names and comments are user text, and
      // a "$'" or "$&" in a replacement string would splice in the page.
      .replace(META_BLOCK_RE, (block) => (meta ? renderMetaTags(meta) : block))
      .replace("</head>", () => `${spotHead(meta?.spot)}</head>`)
      .replace('src="/bundle.js"', `src="${bundleUrl()}"`)
      // A function for the same reason: the spot payload below is user text.
      .replace(
        '<div id="root"></div>',
        () => `
        <script>window.__GM_API_KEY__=${JSON.stringify(gmapApiKey)}</script>
        <script>window.__GA_TAG__=${JSON.stringify(gaTag)}</script>
        <script>window.__COOLING_SHELTERS__=${JSON.stringify(
          coolingSheltersEnabled
        )}</script>${
          // The spot this page is about, as /get-refill-spot would return it,
          // so the card opens as soon as the page hydrates.
          meta?.spot ? `\n        <script>window.__SPOT__=${scriptJson(meta.spot)}</script>` : ""
        }
        <div id="root">${ReactDOMServer.renderToString(
          <App
            gmApiKey={gmapApiKey}
            gaTag={gaTag}
            coolingShelters={coolingSheltersEnabled}
            initialLocale={locale}
            initialSpot={meta?.spot || null}
          />
        )}</div>
        `
      )
      .replace(
        '<div id="ga"></div>',
        `
        <!-- Google tag (gtag.js). The commands queue in dataLayer straight
             away, but the 170KB library is only fetched once the map has
             drawn (the app fires "mymizu:map-painted"), or after 8s if it
             never does, so it no longer shares a phone's connection with the
             bundle, the Maps script, the tiles and the spot photo. -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', ${JSON.stringify(gaTag)});

  (function () {
    var loaded = false;
    function load() {
      if (loaded) return;
      loaded = true;
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(${JSON.stringify(gaTag)});
      document.head.appendChild(s);
    }
    window.addEventListener('mymizu:map-painted', load);
    setTimeout(load, 8000);
  })();
</script>
        `
      )
      .replace("</body>", `${liveReloadScript}</body>`);

    // The document embeds the hashed bundle URL, so it must not be cached past
    // a deploy or clients would keep asking for a bundle that no longer exists.
    res.set("Cache-Control", "private, no-cache");
    return res.send(html);
  });
};

// The spot's own title and description are built server-side. The client sets
// document.title too, but only after auth and a fetch have resolved — invisible
// to social crawlers, which run no JS at all, and slow for search crawlers.
app.get("/refill/:language/:slug", async (req, res) => {
  const {language, slug} = req.params;
  const meta = isLanguage(language) ? await metaForSpot(slug, language) : null;

  // Falls back to the generic map meta if the spot could not be fetched, so a
  // slow or missing spot never costs us the page.
  if (!isLanguage(language)) return renderPage(res, homeMeta(DEFAULT_LOCALE));
  return renderPage(res, meta || spotFallbackMeta(slug, language), language);
});

app.get("/", (req, res) => renderPage(res, homeMeta(DEFAULT_LOCALE)));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
