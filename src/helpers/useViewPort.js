/* eslint-disable no-undef */
import React from "react";

const useViewport = () => {
  const [width, setWidth] = React.useState(() =>
    // No window on the server, which renders an open spot's card too.
    typeof window === "undefined" ? 0 : window.innerWidth
  );

  React.useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  // Return the width so we can use it in our components
  return { width };
};

export { useViewport };
