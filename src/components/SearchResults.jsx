import React, { useEffect, useRef } from "react";
import classnames from "classnames";

export const resultId = (index) => `map-search-result-${index}`;

// The listbox half of the search combobox (see Search.jsx). Options aren't
// focusable: focus stays in the input, which points at the highlighted one.
export function SearchResults({
  id,
  results,
  activeIndex = -1,
  noResults,
  onSearchResultClick,
}) {
  const listRef = useRef();

  // Keep the highlighted result in view as Down and Up move through the list.
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const option = listRef.current.querySelector(`#${resultId(activeIndex)}`);
    option?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div className="map-results">
      <div className={classnames("maps-location-search-results-container")}>
        <ul
          ref={listRef}
          id={id}
          role="listbox"
          className="maps-location-search-results-list"
        >
          {results.filter(Boolean).map((result, index) => {
            return (
              <li
                key={result.name + result.formatted_address}
                id={resultId(index)}
                role="option"
                aria-selected={index === activeIndex}
                className={classnames("maps-location-search-results-result", {
                  ["maps-location-search-results-result-active"]:
                    index === activeIndex,
                })}
                // Keep focus in the input when a result is clicked.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSearchResultClick(result)}
              >
                <div className="maps-location-icon-container">
                  <img
                    className="maps-location-icon"
                    src={result.icon || "/public/location.png"}
                    alt=""
                  />
                </div>
                <div>
                  <div className="maps-location-search-results-result-name">
                    {result.name}
                  </div>
                  <div className="maps-location-search-results-result-address">
                    {result.formatted_address}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {noResults && (
          <p className="maps-location-search-results-empty" aria-hidden="true">
            {noResults}
          </p>
        )}
      </div>
    </div>
  );
}
