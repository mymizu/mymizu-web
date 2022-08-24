require("dotenv").config();

const configEnvVarMap = {
  gmApiKey: "GM_API_KEY",
  apiKey: "API_KEY",
  userToken: "USER_TOKEN",
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
