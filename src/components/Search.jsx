import React, { useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SearchResults } from "./SearchResults";
import googleMapsInstanceAPI from "../../utils/googlemaps";
import classnames from "classnames";

export function Search({ results, onSearch, onReset }) {
  const inputRef = useRef();
  const debounced = useDebouncedCallback(onSearch, 500, { leading: true });

  const handleReset = () => {
    inputRef.current.value = "";
    onReset();
  };

  return (
    <>
      <div className="maps-location-search-container">
        <input
          ref={inputRef}
          className={classnames(`maps-location-search-input`, {
            ["maps-location-search-input-with-results"]: results.length > 0,
          })}
          placeholder="Search"
          onChange={(e) => debounced(e.target.value)}
        />
        <img
          className="maps-location-search-icon"
          src="../../public/images/search.svg"
        />
        <img
          className="maps-location-reset-icon"
          src="../../public/images/reset.svg"
        />
        <img
          className="maps-location-reset-icon"
          src="/public/images/reset.svg"
          onClick={handleReset}
        />
      </div>
    </>
  );
}
