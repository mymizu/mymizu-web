import crypto from "crypto";

import config from "./config";
import { myMizuClient } from "./myMizuClient";

// Canonical origin, matching the share URL in src/utils/transformCardData.js
// and the sitemap the API generates.
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://map.mymizu.co").replace(
  /\/$/,
  ""
);

const DEFAULT_IMAGE = `${SITE_ORIGIN}/public/mymizu-logo.png`;

// Google truncates around 155-160 characters. Spot detail comes first because
// it is what makes the page distinct; the line about mymizu is appended and is
// the part that gets trimmed if a spot has a long name or address.
const MAX_DESCRIPTION = 158;

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

// Trim to a word boundary rather than mid-word, and only add an ellipsis when
// something was actually removed.
const truncate = (text, max) => {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  // Japanese has no spaces, so fall back to a hard cut for those.
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
};

/**
 * Spot-specific sentence first, then the mymizu line if it still fits. A page
 * about a particular tap should read as being about that tap.
 */
const describeSpot = (spot, language) => {
  const name = spot.name || "";
  const address = spot.address || "";
  const water = spot?.grouped_tags?.Water || "";

  let detail;
  if (language === "ja") {
    detail = address
      ? `${name}（${address}）でマイボトルに無料で給水できます。`
      : `${name}でマイボトルに無料で給水できます。`;
    if (water) detail += `水の種類：${water}。`;
  } else {
    detail = address
      ? `Free water refill at ${name}, ${address}.`
      : `Free water refill at ${name}.`;
    if (water) detail += ` ${water} water.`;
  }

  const tagline = TAGLINE[language];
  const joined = `${detail} ${tagline}`;

  // If the spot's own detail already fills the budget, keep that and drop the
  // tagline rather than truncating the useful half.
  if (joined.length <= MAX_DESCRIPTION) return joined;
  if (detail.length >= MAX_DESCRIPTION - 20) return truncate(detail, MAX_DESCRIPTION);
  return truncate(joined, MAX_DESCRIPTION);
};

const titleForSpot = (spot, language) => {
  const name = spot.name || "";
  return language === "ja"
    ? `${name} — 無料給水スポット | mymizu`
    : `${name} — free water refill spot | mymizu`;
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

export const spotMeta = (spot, language, slug) => {
  const l = lang(language);
  const photo = Array.isArray(spot?.photos)
    ? spot.photos.find((p) => p && p.url)
    : null;

  return {
    title: titleForSpot(spot, l),
    description: describeSpot(spot, l),
    language: l,
    canonical: `${SITE_ORIGIN}/refill/${l}/${encodeURIComponent(slug)}`,
    image: photo ? photo.url : DEFAULT_IMAGE,
    alternates: LANGUAGES.map((alt) => ({
      language: alt,
      href: `${SITE_ORIGIN}/refill/${alt}/${encodeURIComponent(slug)}`,
    })),
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
    // A missing or slow spot must not cost us the page.
    console.warn(`Could not build meta for refill spot "${slug}":`, error.message);
    return null;
  }
};
