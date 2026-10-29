import React, { memo, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import classnames from "classnames";
import { categoryMessageId, categoryPin } from "../utils/spotsInView";

const formatDistance = (intl, metres) =>
  metres < 1000
    ? intl.formatNumber(Math.round(metres / 10) * 10, {
        style: "unit",
        unit: "meter",
      })
    : intl.formatNumber(Math.round(metres / 100) / 10, {
        style: "unit",
        unit: "kilometer",
      });

// One spot. Memoised: the list re-renders when the map reports new bounds or
// a row is hovered, and only rows whose spot or distance changed redraw.
const SpotRow = memo(({ tap, distance, locale, onOpen, onHighlight }) => {
  const intl = useIntl();
  const category = intl.formatMessage({ id: categoryMessageId(tap.category_id) });

  const handleClick = (event) => {
    // Let the browser handle a new tab or window.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;
    event.preventDefault();
    onOpen(tap);
  };

  // Hover and focus both point the spot out on the map.
  const highlight = onHighlight ? () => onHighlight(tap.id) : undefined;
  const unhighlight = onHighlight ? () => onHighlight(null) : undefined;

  return (
    <li className="spot-row-item">
      <a
        className="spot-row"
        href={`/refill/${locale}/${tap.slug}`}
        onClick={handleClick}
        onMouseEnter={highlight}
        onMouseLeave={unhighlight}
        onFocus={highlight}
        onBlur={unhighlight}
      >
        <img className="spot-row-pin" src={categoryPin(tap.category_id)} alt="" />
        <span className="spot-row-text">
          <span className="spot-row-name">{tap.name || category}</span>
          <span className="spot-row-meta">
            {category}
            <span aria-hidden="true"> · </span>
            <span className="visually-hidden">, </span>
            {formatDistance(intl, distance)}
            <span className="visually-hidden">
              {" "}
              <FormattedMessage id="spotList.fromCentre" />
            </span>
          </span>
        </span>
      </a>
    </li>
  );
});

// The refill spots in view, as a list: the way to find one without seeing or
// pointing at the map. Each spot is a link to its page; a plain click opens
// it in place, as its marker does.
//
// variant:
//   "panel"   the column beside the map on wide screens (App's spot panel)
//   "compact" a short list under the map, for phones and narrow windows
// spots: [{ tap, distance }] from utils/spotsInView, nearest first
// zoomedIn: false while the map draws clusters, which only some of the taps
//   behind them are loaded for, so the list asks for a closer look instead.
// ready: the map has said where it is (until then there is nothing to list)
// onOpen(tap): opens a spot
// onHighlight(tapId | null): points a spot out on the map (panel only)
export const SpotList = memo(
  ({
    variant,
    headingId,
    spots,
    zoomedIn,
    ready,
    loading,
    locale,
    onOpen,
    onHighlight,
    pageSize,
    hidden,
  }) => {
    const [shown, setShown] = useState(pageSize);

    // Start again from the top when the map moves to another area.
    useEffect(() => setShown(pageSize), [spots, pageSize]);

    const isPanel = variant === "panel";
    const visible = spots.slice(0, shown);

    let note = null;
    if (!zoomedIn) {
      note = "spotList.zoomIn";
    } else if (!spots.length && (loading || !ready)) {
      note = ready ? "loading.spots" : null;
    } else if (!spots.length) {
      note = "spotList.empty";
    } else if (isPanel) {
      note = "spotList.order";
    }

    return (
      <section
        className={classnames("spot-list", `spot-list-${variant}`)}
        aria-labelledby={headingId}
        hidden={hidden}
      >
        <div className="spot-list-header">
          <h2 id={headingId} className="spot-list-title">
            <FormattedMessage id="spotList.title" />
            {zoomedIn && spots.length > 0 && (
              <>
                <span className="visually-hidden"> </span>
                <span className="spot-list-count">
                  <FormattedMessage
                    id="spotList.count"
                    values={{ count: spots.length }}
                  />
                </span>
              </>
            )}
          </h2>
          {note && (
            <p className="spot-list-note">
              <FormattedMessage id={note} />
            </p>
          )}
        </div>
        {zoomedIn && visible.length > 0 && (
          <ul className="spot-list-items">
            {visible.map(({ tap, distance }) => (
              <SpotRow
                key={tap.id}
                tap={tap}
                distance={distance}
                locale={locale}
                onOpen={onOpen}
                onHighlight={isPanel ? onHighlight : undefined}
              />
            ))}
          </ul>
        )}
        {zoomedIn && spots.length > shown && (
          <button
            type="button"
            className="spot-list-more"
            onClick={() => setShown(shown + pageSize)}
          >
            <FormattedMessage id="spotList.showMore" />
          </button>
        )}
      </section>
    );
  }
);
