import axios from "axios";
import queryString from "query-string";
import config from "./config";

const baseURL = "https://api.mymizu.co";

// @NOTES: I'm not sure how userToken is generated.
// I assume that we request for a token initially with an API key. But let's leave it as is for now.
function createMyMizuClient({ apiBaseUrl, apiKey, userToken }) {
  const httpClient = axios.create({
    baseURL: apiBaseUrl,
    timeout: 50000,
  });

  const baseQuery = queryString.stringify({
    api_key: apiKey,
    user_token: userToken,
    l: "en",
    v: 1,
  });
  
  const get = async (
    url,
    data, // Position data
    config, // AxiosRequestConfig
  ) => {
    const urlToUse = `${url}?${baseQuery}&${queryString.stringify(data)}`;
    const response = await httpClient.get(urlToUse, config);

    return response.data;
  }

  const post = async(
    url,
    data,
    config,
  ) => {
    const response = await httpClient.post(url, data, config);

    return response.data;
  };

  return {
    get,
    post,
  }
}

export const myMizuClient = createMyMizuClient({
  apiBaseUrl: baseURL,
  apiKey: config.apiKey,
  userToken: config.userToken,
});
