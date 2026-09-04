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
