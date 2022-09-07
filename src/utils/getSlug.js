const getSlug = (route) => {
  const fullpath = window.location.pathname;
  if (fullpath.includes(route)) {
    const components = fullpath.split(route)[1];
    return components.split("/")[1];
  }
  return "";
};

export default getSlug;
