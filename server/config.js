require("dotenv").config();

const configEnvVarMap = {
  gmApiKey: "GM_API_KEY",
  gaTag: "GA_TAG",
  apiKey: "API_KEY",
  userToken: "USER_TOKEN",
  // Bucket path the API uploads the generated sitemap to. Without it the
  // /sitemap*.xml routes return 503 rather than serving something wrong.
  sitemapSource: "SITEMAP_SOURCE",
};

// Cooling shelters are a seasonal layer: the markers, the category filter and
// the cluster counts that include them. Off unless COOLING_SHELTERS is set to
// a truthy value, so turning them back on is one environment variable and a
// restart — no code change, no rebuild.
//
// Deliberately not a plain Boolean() of the raw string: "false" and "0" are
// truthy strings, and reading those in an env file as "on" is exactly the
// mistake this is meant to be safe against.
const TRUTHY = ["1", "true", "yes", "on"];

export const coolingSheltersEnabled = TRUTHY.includes(
  String(process.env.COOLING_SHELTERS || "")
    .trim()
    .toLowerCase()
);

const getConfig = () => {
  let config = {};
  Object.keys(configEnvVarMap).forEach((key) => {
    const val = process.env[configEnvVarMap[key]];
    if (val) {
      config[key] = val;
    }
  });

  return config;
};

export default getConfig();
