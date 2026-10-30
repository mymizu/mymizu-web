import { useEffect, useState } from "react";

// Whether a media query matches, kept up to date. False on the server and
// for the first render in the browser, so hydration sees the same tree the
// server sent; layout that must be right from the first paint belongs in CSS,
// and this is for behaviour (where focus goes, when the map re-fits).
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    // Safari before 14 only has addListener.
    if (list.addEventListener) {
      list.addEventListener("change", update);
      return () => list.removeEventListener("change", update);
    }
    list.addListener(update);
    return () => list.removeListener(update);
  }, [query]);

  return matches;
};
