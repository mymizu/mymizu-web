import { inBounds } from "./inBounds";

// Tap::COOLING_SHELTER_CATEGORY_ID (backend) = 6
const COOLING_SHELTER_CATEGORY_ID = 6;
const BUSINESS_CATEGORY_ID = 4;

export const categoryMessageId = (categoryId) => {
  if (categoryId === BUSINESS_CATEGORY_ID) return "spotList.category.partner";
  if (categoryId === COOLING_SHELTER_CATEGORY_ID) return "spotList.category.shelter";
  return "spotList.category.spot";
};

// The pin a spot has on the map, so a list row and its marker look alike.
export const categoryPin = (categoryId) => {
  if (categoryId === BUSINESS_CATEGORY_ID) return "/public/images/map-pin-gold.svg";
  if (categoryId === COOLING_SHELTER_CATEGORY_ID) return "/public/images/map-shelter.svg";
  return "/public/images/map-pin.svg";
};

// Metres between two points (haversine). Close enough for sorting a map view.
const distanceInMetres = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

// The taps inside the map's visible area, nearest its centre first, as
// [{ tap, distance }]. Only taps with a slug: each row links to the spot's
// page. An empty list until the map has reported where it is.
//
// bounds: { nw, se } (google-map-react's onChange shape)
export const spotsInView = (taps, bounds) => {
  if (!bounds?.nw || !bounds?.se) return [];
  const centre = {
    lat: (bounds.nw.lat + bounds.se.lat) / 2,
    lng: (bounds.nw.lng + bounds.se.lng) / 2,
  };
  return taps
    .filter((tap) => tap.slug && inBounds(tap.latitude, tap.longitude, bounds))
    .map((tap) => ({
      tap,
      distance: distanceInMetres(centre, {
        lat: tap.latitude,
        lng: tap.longitude,
      }),
    }))
    .sort((a, b) => a.distance - b.distance);
};
