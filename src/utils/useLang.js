import { useState, useEffect } from "react";

export const useLang = () => {
  const [language, setLanguage] = useState();
  useEffect(() => {
    if (/^en\b/.test(window.navigator.language)) {
      setLanguage(window.navigator.language);
    }
  }, []);
  return [language, setLanguage];
};
