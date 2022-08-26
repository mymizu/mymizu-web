const getSlug = (route) => {
  const fullpath = window.location.pathname;
  if (fullpath.includes(route)) {
    const slug = fullpath.split(route)[1];
    return slug;
  }
  return "";
};

export default getSlug;
