// Map data straight from the API's edge-cacheable public URLs
// (api.mymizu.co/api/public/v1, MyMizu#202), rather than through this site's
// own server. Those URLs are the same for everyone looking at the same area,
// so the CDN in front of the API answers most of them from an edge near the
// visitor, and this server isn't in the way at all.
//
// They take no token, no API key and no query string (the API refuses one
// with a 400), and the browser reads them cross-origin, which the API allows
// on these URLs only (MyMizu#208). Plain GETs with no request headers, so
// there's no CORS preflight; fetch rather than axios, because axios here
// carries the user token in a default Authorization header.
//
// Until the API allows that (or if it ever stops), the first request that
// fails switches this off for the session, and the callers go back to this
// server's own routes.
import { MYMIZU_API_BASE_URL } from "../constants";

const PUBLIC_BASE_URL = `${MYMIZU_API_BASE_URL}/api/public/v1`;

// Side of a tile, in degrees: the API's NearbyCache::TILE_CELLS (2) ×
// SNAP_DEGREES (0.02). Part of the /v1 URLs, so it only changes with them.
export const PUBLIC_TILE_DEGREES = 0.04;

// A street-level map view covers a handful of tiles. Anything much bigger is
// asked for as one box through this server, as before, rather than as dozens
// of tile requests.
export const MAX_PUBLIC_TILES = 16;

// The tile index ranges the API serves (NearbyCache::tileInRange): rows cover
// latitudes [-90°, 90°) and columns longitudes [-180°, 180°). Rounded because
// 1 / 0.04 is 24.999….
const TILES_PER_DEGREE = Math.round(1 / PUBLIC_TILE_DEGREES);
const MIN_TILE_Y = -90 * TILES_PER_DEGREE;
const MAX_TILE_Y = 90 * TILES_PER_DEGREE - 1;
const MIN_TILE_X = -180 * TILES_PER_DEGREE;
const MAX_TILE_X = 180 * TILES_PER_DEGREE - 1;
const TILE_COLUMNS = MAX_TILE_X - MIN_TILE_X + 1;

// Columns wrap round the antimeridian; rows stop at the poles. So every tile
// asked for is one the API has.
const wrapX = (x) =>
  ((((x - MIN_TILE_X) % TILE_COLUMNS) + TILE_COLUMNS) % TILE_COLUMNS) +
  MIN_TILE_X;
const clampY = (y) => Math.min(MAX_TILE_Y, Math.max(MIN_TILE_Y, y));

/**
 * The tiles covering a map box (c1 north, c2 west, c3 south, c4 east, as
 * taps/nearby takes them), as [{ y, x }], or null when that would take more
 * than MAX_PUBLIC_TILES. The same mapping as the app's (mymizu-react-native
 * src/utils/publicEdge.js), so both ask for the same, shared, URLs.
 */
export const tilesForBox = ({ c1, c2, c3, c4 }) => {
  const values = [c1, c2, c3, c4].map(Number);
  if (values.some((value) => !Number.isFinite(value))) {
    return null;
  }
  const [north, west, south] = values;
  let east = values[3];
  // A box given across the antimeridian (west 179.9, east -179.9).
  if (west > east && west - east > 180) {
    east += 360;
  }
  const minY = Math.floor(Math.min(north, south) / PUBLIC_TILE_DEGREES);
  const maxY = Math.floor(Math.max(north, south) / PUBLIC_TILE_DEGREES);
  const minX = Math.floor(Math.min(west, east) / PUBLIC_TILE_DEGREES);
  const maxX = Math.floor(Math.max(west, east) / PUBLIC_TILE_DEGREES);

  if ((maxY - minY + 1) * (maxX - minX + 1) > MAX_PUBLIC_TILES) {
    return null;
  }

  const tiles = [];
  const seen = new Set();
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const tile = { y: clampY(y), x: wrapX(x) };
      const key = `${tile.y}/${tile.x}`;
      if (!seen.has(key)) {
        seen.add(key);
        tiles.push(tile);
      }
    }
  }
  return tiles;
};

// Indices as canonical integers ("0", not "-0"): the API only accepts those,
// one URL per tile.
const index = (n) => String(n === 0 ? 0 : n);

export const tileUrl = ({ y, x }, { locale, cooling }) =>
  `${PUBLIC_BASE_URL}/taps/tiles/${locale}/${cooling ? 1 : 0}/${index(y)}/${index(x)}`;

export const clustersUrl = () => `${PUBLIC_BASE_URL}/clusters/all`;

// One level of that tree (MyMizu: TapClusterController@publicLevel), in the
// same shape with only that level: { generated_at, levels: { "3": [...] } }.
export const clusterLevelUrl = (level) => `${PUBLIC_BASE_URL}/clusters/${level}`;

// The API names places in English or Japanese only: the visitor's first
// preference of the two, as this server's getLanguage() picks it.
export const publicLocale = () => {
  const preferred =
    (typeof navigator !== "undefined" &&
      (navigator.languages?.length
        ? navigator.languages
        : [navigator.language])) ||
    [];
  for (const language of preferred) {
    const code = String(language || "").toLowerCase().slice(0, 2);
    if (code === "en" || code === "ja") {
      return code;
    }
  }
  return "en";
};

let available = true;
export const publicApiAvailable = () => available;

// A request the API refused or the browser blocked (no CORS header yet: a
// TypeError, with no status) means the direct route doesn't work here, so
// stop trying it this session. A 429 or a 5xx is passing: this request goes
// through the server instead, and later ones still try the edge.
const settleFailure = (error) => {
  const status = error?.status;
  if (status === undefined || status === 400 || status === 404) {
    available = false;
  }
  console.log("Public API read failed; using this site's server", error);
  return null;
};

const getJson = async (url) => {
  const response = await fetch(url, { credentials: "omit" });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} for ${url}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

/**
 * Taps for a map box from the public tile URLs, as `{ taps }` (each tap once),
 * or null when the caller should ask this server instead: the box is too
 * big, or the direct route isn't available.
 */
export const fetchPublicTaps = async (box, { cooling }) => {
  if (!available) {
    return null;
  }
  const tiles = tilesForBox(box);
  if (!tiles) {
    return null;
  }
  const locale = publicLocale();
  try {
    const responses = await Promise.all(
      tiles.map((tile) => getJson(tileUrl(tile, { locale, cooling })))
    );
    const seen = new Set();
    const taps = [];
    for (const response of responses) {
      for (const tap of response?.taps || []) {
        if (!seen.has(tap.id)) {
          seen.add(tap.id);
          taps.push(tap);
        }
      }
    }
    return { taps };
  } catch (error) {
    return settleFailure(error);
  }
};

// Whether the API serves single levels. An API from before it did answers
// 404, and then the whole tree (fetchPublicClusters) is used instead, so this
// page works on either side of that deploy.
let levelsAvailable = true;

/**
 * One level of the cluster tree from its public URL, or null when the caller
 * should load the whole tree instead (the API predates per-level URLs, or the
 * direct route isn't available). The browser's own HTTP cache revalidates
 * each level with its ETag.
 */
export const fetchPublicClusterLevel = async (level) => {
  if (!available || !levelsAvailable) {
    return null;
  }
  try {
    return await getJson(clusterLevelUrl(level));
  } catch (error) {
    if (error?.status === 404) {
      levelsAvailable = false;
      return null;
    }
    return settleFailure(error);
  }
};

/**
 * The cluster dataset from its public URL, or null to ask this server
 * instead. The browser's own HTTP cache revalidates it with its ETag.
 */
export const fetchPublicClusters = async () => {
  if (!available) {
    return null;
  }
  try {
    return await getJson(clustersUrl());
  } catch (error) {
    return settleFailure(error);
  }
};
