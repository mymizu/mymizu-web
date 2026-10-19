import { MYMIZU_API_BASE_URL } from "../constants";

// Spot photos are stored at up to 2048px, but the card draws them at 360px on
// desktop and the phone's width on mobile. `photos/{id}/w/{width}` (a public
// route, no api_key needed) redirects to the photo at about that many pixels
// wide. The API snaps a width up to the sizes it stores, and never makes one
// larger than the original, so these are the only widths worth offering.
export const PHOTO_WIDTHS = [320, 480, 640, 960, 1280];

// The photo at about `width` pixels wide. A photo without an id keeps its own
// url, as it isn't one the API can resize.
export const photoUrlForWidth = (photo, width) => {
  if (!photo?.id || !width) {
    return photo?.url;
  }

  return `${MYMIZU_API_BASE_URL}/api/photos/${photo.id}/w/${width}`;
};

// A srcset of every stored size, so the browser picks one from the `sizes` of
// the <img> and the screen's pixel ratio. Undefined for a photo without an id.
export const photoSrcSet = (photo) => {
  if (!photo?.id) {
    return undefined;
  }

  return PHOTO_WIDTHS.map(
    (width) => `${photoUrlForWidth(photo, width)} ${width}w`
  ).join(", ");
};
