class GoogleMapsAPI {
  setGoogleAPIObject = (map, maps) => {
    this.map = map;
    this.maps = maps;
    this.AutocompleteService = new maps.places.AutocompleteService();
    this.PlaceService = new maps.places.PlacesService(map);
  }

  search = (input, callback) => {
    this.AutocompleteService.getPlacePredictions({
      input,
    }, (predictions) => {
      Promise.all(
        predictions.map(prediction => {
          return this.lookupPlace(prediction.place_id)
        })
      ).then(callback)
    })
    // only returns a single place
    // Reference: https://developers.google.com/maps/documentation/javascript/places#place_search_fields
    // this.PlaceService.findPlaceFromQuery({
    //   query,
    //   fields: [
    //     'icon',
    //     'name',
    //     'formatted_address',
    //     'geometry.location',
    //   ],
    // }, callback)
  }

  lookupPlace = (placeId) => new Promise((resolve, reject) => {
    this.PlaceService.getDetails({
      placeId,
      fields: [
        'icon',
        'name',
        'formatted_address',
        'geometry.location',
      ],
    }, resolve)
  })
}

const googleMapsInstanceAPI = new GoogleMapsAPI()
export default googleMapsInstanceAPI;