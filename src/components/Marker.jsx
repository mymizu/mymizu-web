import React, { memo } from "react";
import classnames from "classnames";
import { useIntl } from "react-intl";

// Tap::COOLING_SHELTER_CATEGORY_ID (backend) = 6
const COOLING_SHELTER_CATEGORY_ID = 6;
const BUSINESS_CATEGORY_ID = 4;

// A button, so keyboard and screen reader users can reach and open a spot.
// Mouse and touch clicks still reach the map's onChildClick (google-map-react
// works out which marker was clicked from the pointer position). A keyboard
// click has no pointer position, so it is handled here instead: see
// keyboardClick.
//
// isHighlighted: the spot's row in the list beside the map is hovered or
// focused, so its pin is drawn larger and on top.
//
// Memoised: App re-renders whenever a list row is hovered, and the map can
// hold hundreds of markers. Only the ones whose props changed redraw (App
// passes a stable onKeyboardClick for this).
export const Marker = memo((props) => {
  const {
    category,
    isSearch,
    isActive,
    isHighlighted,
    tap,
    inView = true,
    onKeyboardClick,
  } = props;
  const intl = useIntl();

  // Base pin variant (before any "-active" suffix is applied). Every variant
  // -- map-pin, map-pin-gold, map-shelter, map-shelter-gold, map-pin-natural
  // -- has a matching "<name>-active.svg" asset, so activation is just a
  // filename swap rather than a per-category special case.
  const getBasePinName = () => {
    if (category === BUSINESS_CATEGORY_ID) {
      return "map-pin-gold";
    }
    if (category === COOLING_SHELTER_CATEGORY_ID) {
      return "map-shelter";
    }

    return "map-pin";
  };

  const getPinSrc = () => {
    const base = getBasePinName();
    const suffix = isActive ? "-active" : "";
    return `/public/images/${base}${suffix}.svg`;
  };

  return (
    <button
      type="button"
      className={classnames("marker", { ["marker-highlighted"]: isHighlighted })}
      aria-label={
        tap?.name ||
        intl.formatMessage({
          id:
            category === COOLING_SHELTER_CATEGORY_ID
              ? "marker.unnamedShelter"
              : "marker.unnamed",
        })
      }
      aria-current={isActive ? "true" : undefined}
      {...offMapProps(inView)}
      onClick={keyboardClick(onKeyboardClick, tap?.id, props)}
    >
      <img
        className={classnames(`pin`, {
          ["pin-large"]: isSearch,
        })}
        src={getPinSrc()}
        alt=""
      />
    </button>
  );
});

// google-map-react renders every marker it is given, including the ones
// panned out of view. Those stay out of the Tab order and the accessibility
// tree, or a keyboard user would Tab through hundreds of invisible pins.
export const offMapProps = (inView) =>
  inView ? {} : { tabIndex: -1, "aria-hidden": "true" };

// A click from Enter or Space has detail 0 (no pointer press). It carries no
// pointer position, so google-map-react can't tell which marker it was for:
// open it from here, and stop it reaching the map, which would otherwise act
// on whichever marker the mouse last hovered.
export const keyboardClick = (onKeyboardClick, key, props) => (event) => {
  if (event.detail !== 0 || !onKeyboardClick) return;
  event.stopPropagation();
  onKeyboardClick(key, props);
};
