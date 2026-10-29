import React, { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { MIN_ZOOM_FOR_INDIVIDUAL_TAPS } from "../utils/clusters";

// Tap::COOLING_SHELTER_CATEGORY_ID (backend) = 6
const COOLING_SHELTER_CATEGORY_ID = 6;
const BUSINESS_CATEGORY_ID = 4;

const PAGE_SIZE = 20;

const categoryMessageId = (categoryId) => {
  if (categoryId === BUSINESS_CATEGORY_ID) return "spotList.category.partner";
  if (categoryId === COOLING_SHELTER_CATEGORY_ID) return "spotList.category.shelter";
  return "spotList.category.spot";
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

const inBounds = (tap, { nw, se }) =>
  tap.latitude <= nw.lat &&
  tap.latitude >= se.lat &&
  tap.longitude >= nw.lng &&
  tap.longitude <= se.lng;

// The spots on the map, as a list: the way to find one without seeing or
// pointing at the map. Built from the taps the map already has, limited to
// the part of the map in view and nearest its centre first. Each spot is a
// link to its page; a plain click opens its card in place, as its marker does.
//
// taps: the taps the map shows (App's visibleTaps)
// bounds: the map's visible area, { nw, se } (google-map-react's onChange)
// zoom: the map's zoom. Zoomed out, the map shows clusters and only some of
//   their taps are loaded, so the list asks for a closer look instead.
// onOpen(tap): opens a spot's card.
export const SpotList = ({ taps, bounds, zoom, locale, onOpen }) => {
  const intl = useIntl();
  const [shown, setShown] = useState(PAGE_SIZE);

  const zoomedIn = zoom >= MIN_ZOOM_FOR_INDIVIDUAL_TAPS;

  const spots = useMemo(() => {
    if (!zoomedIn || !bounds?.nw || !bounds?.se) return [];
    const centre = {
      lat: (bounds.nw.lat + bounds.se.lat) / 2,
      lng: (bounds.nw.lng + bounds.se.lng) / 2,
    };
    return taps
      .filter((tap) => tap.slug && inBounds(tap, bounds))
      .map((tap) => ({
        tap,
        distance: distanceInMetres(centre, {
          lat: tap.latitude,
          lng: tap.longitude,
        }),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [taps, bounds, zoomedIn]);

  // Start again from the top when the map moves to another area.
  useEffect(() => setShown(PAGE_SIZE), [bounds]);

  const formatDistance = (metres) =>
    metres < 1000
      ? intl.formatNumber(Math.round(metres / 10) * 10, {
          style: "unit",
          unit: "meter",
        })
      : intl.formatNumber(Math.round(metres / 100) / 10, {
          style: "unit",
          unit: "kilometer",
        });

  const handleClick = (event, tap) => {
    // Let the browser handle a new tab or window.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
    event.preventDefault();
    // The card opens over the map, which may be scrolled out of view.
    document.querySelector(".maps-container")?.scrollIntoView({ block: "start" });
    onOpen(tap);
  };

  return (
    <section
      id="spot-list"
      className="spot-list container-lg"
      aria-labelledby="spot-list-title"
    >
      <h2 id="spot-list-title" className="spot-list-title">
        {spots.length > 0 ? (
          <FormattedMessage
            id="spotList.titleWithCount"
            values={{
              count: spots.length,
              muted: (chunks) => (
                <span className="spot-list-count">{chunks}</span>
              ),
            }}
          />
        ) : (
          <FormattedMessage id="spotList.title" />
        )}
      </h2>
      {!zoomedIn ? (
        <p className="spot-list-note">
          <FormattedMessage id="spotList.zoomIn" />
        </p>
      ) : spots.length === 0 ? (
        <p className="spot-list-note">
          <FormattedMessage id="spotList.empty" />
        </p>
      ) : (
        <>
          <p className="spot-list-note">
            <FormattedMessage id="spotList.order" />
          </p>
          <ul className="spot-list-items">
            {spots.slice(0, shown).map(({ tap, distance }) => (
              <li key={tap.id} className="spot-list-item">
                <a
                  className="spot-list-link"
                  href={`/refill/${locale}/${tap.slug}`}
                  onClick={(event) => handleClick(event, tap)}
                >
                  <span className="spot-list-name">
                    {tap.name ||
                      intl.formatMessage({ id: categoryMessageId(tap.category_id) })}
                  </span>
                  <span className="spot-list-meta">
                    <FormattedMessage id={categoryMessageId(tap.category_id)} />
                    {" · "}
                    {formatDistance(distance)}
                    <span className="visually-hidden">
                      {" "}
                      <FormattedMessage id="spotList.fromCentre" />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {spots.length > shown && (
            <button
              type="button"
              className="spot-list-more"
              onClick={() => setShown(shown + PAGE_SIZE)}
            >
              <FormattedMessage id="spotList.showMore" />
            </button>
          )}
        </>
      )}
    </section>
  );
};
