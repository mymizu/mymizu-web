import React, { useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce';
import { SearchResults } from './SearchResults'
import googleMapsInstanceAPI from './utils/googlemaps'

export function Search({ results, onSearch, onReset }) {
  const inputRef = useRef();
  const debounced = useDebouncedCallback(
    onSearch,
    500,
    { leading: true }
  );

  const handleReset = () => {
    inputRef.current.value = "";
    onReset();
  }

  return (
    <>
      <div className="maps-location-search-container">
        <input
          ref={inputRef}
          className={`maps-location-search-input ${results.length > 0 ? "maps-location-search-input-with-results" : ""}`}
          placeholder="Search"
          onChange={(e) => debounced(e.target.value)}
        />
        <img className="maps-location-search-icon" src="/public/search.svg" />
        <img className="maps-location-reset-icon" src="/public/reset.svg" onClick={handleReset} />
      </div>
    </>
  )
}
