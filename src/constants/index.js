export const LANG_PREF_KEY = "userLanguage";

// Shared by the server's API client and the browser, which loads spot photos
// from the API's public photo routes directly.
export const MYMIZU_API_BASE_URL = "https://api.mymizu.co";

// When the spot panel is a column beside the map (wide windows) rather than
// the card over the map and the short list under it (phones). Must match the
// "Spot panel" media query in public/styles/main.css. The device-width part
// keeps out a phone in landscape, which the phone layout already claims.
export const SPOT_PANEL_COLUMN_QUERY =
  "(min-width: 900px) and (min-device-width: 813px)";
