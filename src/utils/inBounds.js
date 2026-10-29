// Whether a point is inside the map's visible area.
// bounds: { nw: {lat,lng}, se: {lat,lng} } (google-map-react's onChange shape).
// Unknown bounds count as in view, so nothing is hidden before the map has
// reported where it is.
export const inBounds = (lat, lng, bounds) => {
  if (!bounds || !bounds.nw || !bounds.se) return true;
  const { nw, se } = bounds;
  return lat <= nw.lat && lat >= se.lat && lng >= nw.lng && lng <= se.lng;
};
