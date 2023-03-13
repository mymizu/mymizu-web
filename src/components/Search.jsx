import React, { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { IntlProvider, useIntl } from 'react-intl';
import classnames from "classnames";

export function Search({ 
  results, onSearch, onReset,
  showSearchRecommendation, setShowSearchRecommendation 
}) {
  const inputRef = useRef();
  const debounced = useDebouncedCallback(onSearch, 500, { leading: true });
  const showResultInputs =
    results.length > 0 ? "maps-location-search-input-with-results" : "";

  const handleReset = () => {
    inputRef.current.value = "";
    onReset();
  };

  useEffect(() => {
    console.log(inputRef.current.value);
  }, [inputRef.current]);

  const intl = useIntl();

  return (
    <div 
      className="map-location-search" 
      onMouseDown={setShowSearchRecommendation}
      onClick={setShowSearchRecommendation}
    >
      <div className="maps-location-search-container">
        <div
          className={classnames("maps-location-search-content", {
            ["maps-location-search-content-with-result"]: (
              results.length > 0 && showSearchRecommendation
            ),
          })}
        >
          <div className="input-icon-search-container">
            <img
              className="maps-location-search-icon"
              src="../../public/images/search.svg"
            />
          </div>
          <input
            ref={inputRef}
            className={`maps-location-search-input ${showResultInputs}`}
            placeholder={intl.formatMessage({ id: 'search' })}
            onChange={(e) => debounced(e.target.value)}
          />
          <div className="input-icon-reset-container">
            <img
              className="maps-location-reset-icon"
              src="/public/images/reset.svg"
              onClick={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
