import { useViewport } from "./index";

const checkViewPort = () => {
  const { width } = useViewport();

  const group = {
    title: "",
    width: 0,
  };

  if (width >= 1024) {
    group.title = "desktop";
    group.width = width;
  } else if (width >= 540) {
    group.title = "tablet";
    group.width = width;
  } else if (width >= 280) {
    group.title = "mobile";
    group.width = width;
  }

  return { group };
};

export { checkViewPort };
