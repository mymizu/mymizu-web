import React, { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce';
import { SearchResults } from './SearchResults'
import googleMapsInstanceAPI from './utils/googlemaps'

export function Search({ results, onSearch }) {
  const debounced = useDebouncedCallback(
    onSearch,
    500,
    { leading: true }
  );

  return (
    <>
      <div className="maps-location-search-container">
        <input
          className={`maps-location-search-input ${results.length > 0 ? "maps-location-search-input-with-results" : ""}`}
          placeholder="Search"
          onChange={(e) => debounced(e.target.value)}
        />
        <img className="maps-location-search-icon" src="/public/search.png" />
      </div>
    </>
  )
}
