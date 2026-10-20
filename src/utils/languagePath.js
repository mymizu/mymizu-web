// Refill spot pages carry their language in the path: /refill/{en|ja}/{slug}.
const LANGUAGES = ["en", "ja"];
const REFILL_PATH = /^\/refill\/([^/]+)\/(.+)$/;

// The language a refill spot URL is in, or null for any other page (or an
// unknown language).
export const languageFromPath = (pathname) => {
  const match = pathname.match(REFILL_PATH);
  return match && LANGUAGES.includes(match[1]) ? match[1] : null;
};

// The same refill spot page in another language, or null when the path isn't
// a refill spot page (the map itself has no language in its URL).
export const pathForLanguage = (pathname, language) => {
  const match = pathname.match(REFILL_PATH);
  return match ? `/refill/${language}/${match[2]}` : null;
};
