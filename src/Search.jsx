import React from 'react'
import { SearchResults } from './SearchResults'

export function Search({ results }) {
  return (
    <>
      <div className="maps-location-search-container">
        <input className={`maps-location-search-input ${results.length > 0 ? "maps-location-search-input-with-results" : ""}`} placeholder="Search" />
        <img className="maps-location-search-icon" src="/public/search.png" />
      </div>
    </>
  )
}
