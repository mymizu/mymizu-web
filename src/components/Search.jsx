import React, { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useIntl } from "react-intl";
import classnames from "classnames";
import { SearchResults, resultId } from "./SearchResults";

const LISTBOX_ID = "map-search-results";

// The place search, as an ARIA combobox (the APG "list autocomplete" pattern):
// typing searches, Down and Up move through the results, Enter picks one and
// Escape closes the list. Focus stays in the input throughout; the highlighted
// result is announced through aria-activedescendant.
export function Search({ results, onSearch, onReset, onSearchResultClick }) {
  const intl = useIntl();
  const inputRef = useRef();
  const debounced = useDebouncedCallback(onSearch, 500, { leading: true });

  // Escape hides the list without clearing what was typed; typing shows it.
  const [open, setOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Set from typing until a result is picked or the search is cleared or
  // closed, so a reply with no places can be told apart from the empty list
  // before anything was typed or after a result was picked.
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("");

  const options = results.filter(Boolean);
  const expanded = open && options.length > 0;
  const showNoResults = open && !options.length && !!status;

  useEffect(() => {
    setActiveIndex(-1);
    if (!searching || !inputRef.current?.value) return;
    setStatus(
      options.length
        ? intl.formatMessage({ id: "search.results" }, { count: options.length })
        : intl.formatMessage({ id: "search.noResults" })
    );
  }, [results]);

  const handleChange = (e) => {
    const value = e.target.value;
    setOpen(true);
    if (value) {
      setSearching(true);
      debounced(value);
    } else {
      setSearching(false);
      setStatus("");
      debounced.cancel();
      onReset();
    }
  };

  const select = (result) => {
    setSearching(false);
    setStatus("");
    setActiveIndex(-1);
    onSearchResultClick(result);
  };

  const handleReset = () => {
    inputRef.current.value = "";
    setStatus("");
    setSearching(false);
    onReset();
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        if (!options.length) return;
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        if (!options.length) return;
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
        break;
      case "Enter":
        if (!expanded) return;
        e.preventDefault();
        select(options[activeIndex >= 0 ? activeIndex : 0]);
        break;
      case "Escape":
        // Only when there is a list to close: otherwise Escape is left to
        // the spot card, which closes on it.
        if (expanded || showNoResults) {
          e.stopPropagation();
          setOpen(false);
          setSearching(false);
          setActiveIndex(-1);
          setStatus("");
        }
        break;
      default:
    }
  };

  return (
    <>
      <div className="map-location-search">
        <div className="maps-location-search-container">
          <div
            className={classnames("maps-location-search-content", {
              ["maps-location-search-content-with-result"]: expanded || showNoResults,
            })}
          >
            <div className="input-icon-search-container">
              <img
                className="maps-location-search-icon"
                src="../../public/images/search.svg"
                alt=""
              />
            </div>
            <label htmlFor="map-search-input" className="visually-hidden">
              {intl.formatMessage({ id: "search.label" })}
            </label>
            <input
              ref={inputRef}
              id="map-search-input"
              type="text"
              className={classnames("maps-location-search-input", {
                ["maps-location-search-input-with-results"]: expanded,
              })}
              placeholder={intl.formatMessage({ id: "search" })}
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={expanded}
              aria-controls={LISTBOX_ID}
              aria-activedescendant={
                expanded && activeIndex >= 0 ? resultId(activeIndex) : undefined
              }
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <div className="input-icon-reset-container">
              <button
                type="button"
                className="maps-location-reset-button"
                aria-label={intl.formatMessage({ id: "search.clear" })}
                onClick={handleReset}
              >
                <img
                  className="maps-location-reset-icon"
                  src="/public/images/reset.svg"
                  alt=""
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <SearchResults
        id={LISTBOX_ID}
        results={expanded ? options : []}
        activeIndex={activeIndex}
        noResults={showNoResults ? status : null}
        onSearchResultClick={select}
      />
      <div role="status" className="visually-hidden">
        {status}
      </div>
    </>
  );
}
