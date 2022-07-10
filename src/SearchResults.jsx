import React from 'react'

export function SearchResults({ results, onSearchResultClick }) {
  return (
    <>
      <div className="maps-location-search-results-container">
        {results.map((result) => {
          return (
            <div
              key={result.name + result.formatted_address}
              className="maps-location-search-results-result"
              onClick={() => onSearchResultClick(result)}
              tabIndex={0}
            >
              <div className="maps-location-icon-container">
                <img className="maps-location-icon" src={result.icon || '/public/location.png'} />
              </div>
              <div>
                <div className="maps-location-search-results-result-name">{result.name}</div>
                <div className="maps-location-search-results-result-address">{result.formatted_address}</div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
