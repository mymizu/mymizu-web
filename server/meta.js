import crypto from "crypto";

import { myMizuClient } from "./myMizuClient";
import { spotTitle } from "../src/utils/spotTitle";

// Canonical origin, matching the share URL in src/utils/transformCardData.js
// and the sitemap the API generates.
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://map.mymizu.co").replace(
  /\/$/,
  ""
);

const DEFAULT_IMAGE = `${SITE_ORIGIN}/public/mymizu-logo.png`;

// Google cuts descriptions by display width, not characters: about 155-160
// characters of English, and roughly 100-120 of Japanese, whose characters are
// twice as wide. Spot detail comes first because it is what makes the page
// distinct; the line about mymizu is appended only if it still fits.
const MAX_DESCRIPTION = { en: 158, ja: 110 };

// Length as Google lays it out. Japanese pages often carry romanised addresses
// and English comments, so there a half-width character counts as half.
const displayLength = (text, language) =>
  language === "ja"
    ? [...text].reduce((sum, ch) => sum + (ch.codePointAt(0) > 0xff ? 1 : 0.5), 0)
    : text.length;

// What mymizu is, for people meeting it in a search result or a shared link.
const TAGLINE = {
  en: "mymizu is a free map of 200,000+ places to refill your bottle.",
  ja: "mymizuは20万カ所以上の無料給水スポットが見つかる給水MAPです。",
};

const HOME = {
  en: {
    title: "mymizu — find free water refill spots near you",
    description:
      "Find free drinking water near you. mymizu maps 200,000+ cafés, shops, restaurants and public fountains where you can refill your bottle for free.",
  },
  ja: {
    title: "mymizu — 近くの無料給水スポットを探す",
    description:
      "近くの無料給水スポットを探せます。カフェ・お店・公共の水飲み場など20万カ所以上。マイボトルに給水して、使い捨てプラスチックを減らしましょう。",
  },
};

export const LANGUAGES = ["en", "ja"];
export const isLanguage = (value) => LANGUAGES.includes(value);
const lang = (value) => (isLanguage(value) ? value : "en");

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Tap::COOLING_SHELTER_CATEGORY_ID (backend) = 6
const COOLING_SHELTER_CATEGORY_ID = 6;

const oneLine = (text) => String(text || "").replace(/\s+/g, " ").trim();

// Trim to a word boundary rather than mid-word, and only add an ellipsis when
// something was actually removed.
const truncate = (text, max) => {
  const clean = oneLine(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  // Japanese has no spaces, so fall back to a hard cut for those.
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
};

// End a fragment with the language's full stop, unless it already has one. A
// fragment that ends in a colon is a heading ("Hours:") cut from what it
// introduced, so it is dropped.
const sentence = (text, language) => {
  const clean = oneLine(text);
  if (/[:：]$/.test(clean)) return "";
  if (!clean || /[.!?。！？…]$/.test(clean)) return clean;
  return clean + (language === "ja" ? "。" : ".");
};

/**
 * Where the spot is, short enough to sit next to its name. Addresses come in
 * two shapes: geocoder output, "13-9, Fukasawa 2 Chome, Umegaoka, Setagaya,
 * Tokyo Prefecture, Japan", whose last few parts are the area; and Japanese
 * postal addresses with no commas, "〒144-0041 東京都大田区羽田空港", which are
 * short and kept whole once the postcode is gone.
 */
const areaOf = (spot) => {
  const address = oneLine(spot.address)
    // Google Maps style, "日本、〒659-0094 兵庫県…": the country and postcode
    // add length without saying anything about where the spot is.
    .replace(/^日本[、,]?\s*/, "")
    .replace(/〒?\s*\d{3}-\d{4}\s*/g, "")
    .trim();
  // Some spots carry their name as the address, which adds nothing.
  if (!address || address === oneLine(spot.name)) return "";

  const parts = address
    .split(/\s*,\s*/)
    // Postcodes and house numbers are noise in a search snippet.
    .filter((part) => part && !/^[\d\s-]+$/.test(part));
  return truncate(parts.slice(-3).join(", "), 60);
};

/**
 * What the spot offers, from its tags. The API sends them grouped under
 * localised labels ({"Type of Water": ["Filtered", "Tap"]}, or {"水の種類":
 * [...]} in Japanese), and an empty array when there are none. The labels are
 * already in the page's language, so they are used as they come rather than
 * matched against a list that would go stale when a group is added.
 */
const offersOf = (spot, language) => {
  const groups = spot.grouped_tags;
  if (!groups || typeof groups !== "object" || Array.isArray(groups)) return [];

  return Object.entries(groups)
    .filter(([, tags]) => Array.isArray(tags) && tags.length)
    .map(([label, tags]) =>
      language === "ja" ? `${label}：${tags.join("、")}` : `${label}: ${tags.join(", ")}`
    );
};

/**
 * Built from the most distinctive detail down: what and where the spot is,
 * what it offers, how to refill, then how to find it. Each piece is added only
 * if it fits whole, so a long one is skipped rather than cut mid-sentence and
 * the shorter ones after it still get their chance. The mymizu line goes last
 * and only if there is room: a page about a particular tap should read as being
 * about that tap. Without a description at all, Google built the snippet from
 * the nav and footer text.
 */
const describeSpot = (spot, language) => {
  const max = MAX_DESCRIPTION[language];
  const name = oneLine(spot.name);
  const area = areaOf(spot);
  const shelter = spot.category_id === COOLING_SHELTER_CATEGORY_ID;

  let lead;
  if (language === "ja") {
    const place = area ? `${name}（${area}）` : name;
    lead = shelter
      ? `${place}は暑さをしのげるクーリングシェルターです。`
      : `${place}でマイボトルに無料で給水できます。`;
  } else {
    const place = area ? `${name}, ${area}` : name;
    lead = shelter
      ? `${place}: a cooling shelter, somewhere to rest out of the heat.`
      : `Free water refill at ${place}.`;
  }

  // Location is the purpose-written "how to find it"; older spots only have
  // the free-text comment, whose first line is usually the same thing.
  const comment = String(spot.simple_comment || "").split(/\r?\n/)[0];
  const directions = spot.location || comment;

  const optional = [...offersOf(spot, language), spot.refill_instruction, directions]
    .map((piece) => sentence(piece, language))
    .filter(Boolean);

  // Japanese runs sentences together, except after one written in English.
  const join = (a, b) =>
    language === "ja" && !/[\x21-\x7e]$/.test(a) ? `${a}${b}` : `${a} ${b}`;

  let description = truncate(lead, max);
  for (const piece of optional) {
    const next = join(description, piece);
    if (displayLength(next, language) <= max) description = next;
  }

  const withTagline = join(description, TAGLINE[language]);
  return displayLength(withTagline, language) <= max ? withTagline : description;
};

export const homeMeta = (language) => {
  const l = lang(language);
  return {
    ...HOME[l],
    language: l,
    canonical: `${SITE_ORIGIN}/`,
    image: DEFAULT_IMAGE,
    alternates: LANGUAGES.map((alt) => ({ language: alt, href: `${SITE_ORIGIN}/` })),
  };
};

const spotUrl = (slug, language) =>
  `${SITE_ORIGIN}/refill/${language}/${encodeURIComponent(slug)}`;

// Matches the hreflang set the sitemap declares for every spot, x-default
// included, so the two do not disagree about which page is which.
const spotAlternates = (slug) =>
  [...LANGUAGES, "x-default"].map((alt) => ({
    language: alt,
    href: spotUrl(slug, alt === "x-default" ? "en" : alt),
  }));

export const spotMeta = (spot, language, slug) => {
  const l = lang(language);
  const photo = Array.isArray(spot?.photos)
    ? spot.photos.find((p) => p && p.url)
    : null;

  return {
    title: spotTitle(spot, l),
    description: describeSpot(spot, l),
    language: l,
    canonical: spotUrl(slug, l),
    image: photo ? photo.url : DEFAULT_IMAGE,
    alternates: spotAlternates(slug),
  };
};

/**
 * For a spot page whose spot could not be fetched: the map's own title and
 * description, but still canonical to the spot URL. Pointing it at the home
 * page instead would tell Google, on any crawl that hit a slow API, that the
 * spot page is a duplicate of the map and can be dropped from the index.
 */
export const spotFallbackMeta = (slug, language) => {
  if (!isLanguage(language)) return homeMeta(language);
  return {
    ...homeMeta(language),
    canonical: spotUrl(slug, language),
    alternates: spotAlternates(slug),
  };
};

/**
 * The tags themselves. Open Graph and Twitter are included because a refill
 * spot link is something people share — without these, every shared link
 * previewed as a bare "mymizu" with no description or image.
 */
export const renderMetaTags = (meta) => {
  const t = escapeAttr(meta.title);
  const d = escapeAttr(meta.description);
  const url = escapeAttr(meta.canonical);
  const img = escapeAttr(meta.image);

  const alternates = (meta.alternates || [])
    .map(
      (a) =>
        `  <link rel="alternate" hreflang="${escapeAttr(a.language)}" href="${escapeAttr(a.href)}">`
    )
    .join("\n");

  return `  <title>${t}</title>
  <meta name="description" content="${d}">
  <link rel="canonical" href="${url}">
${alternates}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="mymizu">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${img}">
  <meta property="og:locale" content="${meta.language === "ja" ? "ja_JP" : "en_US"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${img}">`;
};

// --- spot lookup -------------------------------------------------------------
// Fetching the spot server-side is what makes per-spot meta possible at all:
// the client-side title (set in a useEffect after auth) is invisible to every
// social crawler, and slow for search crawlers. It is kept off the critical
// path as far as possible: the token is reused, results are cached, the request
// is given a short timeout, and any failure falls back to the generic meta
// rather than delaying or breaking the page.

const SPOT_TIMEOUT_MS = 2500;
const SPOT_CACHE_TTL_MS = 60 * 60 * 1000;
const SPOT_CACHE_MAX = 500;

const spotCache = new Map(); // `${language}:${slug}` -> { meta, at }
let tokenPromise = null;

const acquireToken = () => {
  if (tokenPromise) return tokenPromise;

  tokenPromise = myMizuClient(null, "en")
    .get("/api/start", {
      l: "en",
      platform: "web",
      client_version: "1.0",
      client_build: "100",
      uuid: crypto.randomUUID(),
    })
    .then((res) => {
      const token = res?.new_token;
      if (!token) throw new Error("no token in /api/start response");
      return token;
    })
    .catch((error) => {
      // Do not cache a failure, or one blip would disable spot meta until the
      // next deploy.
      tokenPromise = null;
      throw error;
    });

  return tokenPromise;
};

const rememberSpot = (key, meta) => {
  if (spotCache.size >= SPOT_CACHE_MAX) {
    // Cheap FIFO eviction: enough for the handful of spots that actually get
    // shared, and bounded so 26k spots cannot fill memory.
    spotCache.delete(spotCache.keys().next().value);
  }
  spotCache.set(key, { meta, at: Date.now() });
};

export const metaForSpot = async (slug, language) => {
  const l = lang(language);
  const key = `${l}:${slug}`;

  const hit = spotCache.get(key);
  if (hit && Date.now() - hit.at < SPOT_CACHE_TTL_MS) return hit.meta;

  try {
    const token = await acquireToken();
    const spot = await myMizuClient(token, l).get(
      `/api/taps/${encodeURIComponent(slug)}/`,
      {},
      { timeout: SPOT_TIMEOUT_MS }
    );

    if (!spot || !spot.name) throw new Error("spot payload had no name");

    const meta = spotMeta(spot, l, slug);
    rememberSpot(key, meta);
    return meta;
  } catch (error) {
    // The token is held for the life of the process. If the API stops
    // accepting it, mint a new one next time instead of serving the generic
    // meta on every spot page until the next deploy.
    const status = error?.response?.status;
    if (status === 401 || status === 403) tokenPromise = null;

    // A missing or slow spot must not cost us the page.
    console.warn(`Could not build meta for refill spot "${slug}":`, error.message);
    return null;
  }
};
