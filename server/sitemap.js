import axios from "axios";

import config from "./config";

// Canonical origin for every URL in the sitemap. Must match the share URL built
// in src/utils/transformCardData.js, and the base_url the API generates with
// (config/mymizu.php -> sitemap.base_url), or Google sees competing URLs for the
// same spot.
export const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://map.mymizu.co";

// Where the API uploads the generated sitemap. The API builds it, because this
// app has no cheap way to enumerate the network: /api/taps/nearby caps at 500
// results and ignores page/limit, so covering ~200k spots from here would mean
// ~1,900 tiled, rate-limited requests. See `php artisan mymizu:generate-sitemap`
// in the MyMizu repo, which runs nightly and writes to the cloud disk.
//
// We proxy those files rather than redirecting to them, because a sitemap may
// only list URLs on the host that serves it. Served from here, the sitemap and
// the spot URLs share an origin, so no Search Console cross-submission is needed.
const SITEMAP_SOURCE = (config.sitemapSource || "").replace(/\/$/, "");

// The upstream file changes once a day; hold it briefly so a burst of crawler
// requests doesn't become a burst of S3 reads.
const CACHE_TTL_MS = 60 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 30000;

const cache = new Map(); // name -> { body, fetchedAt }
const inFlight = new Map(); // name -> Promise

// Only ever fetch names we generate ourselves. Without this the :page route
// would let a caller shape an arbitrary upstream path.
const isAllowedName = (name) =>
  name === "sitemap.xml" || /^sitemap-spots-\d{1,4}\.xml$/.test(name);

export const isSitemapConfigured = () => SITEMAP_SOURCE !== "";

const fetchUpstream = async (name) => {
  const response = await axios.get(`${SITEMAP_SOURCE}/${name}`, {
    timeout: UPSTREAM_TIMEOUT_MS,
    // Sitemaps are plain XML; hand it back as a string, untouched.
    responseType: "text",
    transformResponse: [(data) => data],
    // S3 returns 403 rather than 404 for a missing object when the caller has no
    // ListBucket permission, so both mean "not there".
    validateStatus: (status) => status === 200 || status === 404 || status === 403,
  });

  if (response.status === 404 || response.status === 403) {
    const error = new Error(`Sitemap ${name} not found upstream`);
    error.notFound = true;
    throw error;
  }

  return response.data;
};

export const getSitemap = async (name) => {
  if (!isAllowedName(name)) {
    const error = new Error(`Refusing to proxy unexpected sitemap name: ${name}`);
    error.notFound = true;
    throw error;
  }

  if (!isSitemapConfigured()) {
    throw new Error("SITEMAP_SOURCE is not configured");
  }

  const cached = cache.get(name);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.body;
  }

  // Single-flight: several crawlers can ask for the same file at once.
  if (!inFlight.has(name)) {
    const request = fetchUpstream(name)
      .then((body) => {
        cache.set(name, { body, fetchedAt: Date.now() });
        return body;
      })
      .finally(() => {
        inFlight.delete(name);
      });
    inFlight.set(name, request);
  }

  try {
    return await inFlight.get(name);
  } catch (error) {
    // Stale content beats no content: a missing sitemap can make Google drop
    // URLs it had already indexed. A genuine 404 is passed through as-is.
    if (!error.notFound && cached) return cached.body;
    throw error;
  }
};

export const buildRobotsTxt = () => `User-agent: *
Allow: /

# JSON endpoints the SPA calls. They render nothing for a crawler and would
# only burn crawl budget.
Disallow: /api/
Disallow: /get-initial-markers
Disallow: /get-marker-moving-map
Disallow: /get-refill-spot/
Disallow: /get-clusters
Disallow: /community

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
