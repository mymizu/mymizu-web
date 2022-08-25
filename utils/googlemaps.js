function googleMapsAPI(map, maps) {
  const autoCompleteService = new maps.places.AutocompleteService();
  const placeService = new maps.places.PlacesService(map);

  const search = (input, callback) => {
    autoCompleteService.getPlacePredictions(
      {
        input,
      },
      async (predictions) => {
        if (!predictions) {
          callback([]);
          return;
        }
        const places = [];
        for (let i = 0; i < predictions.length; i++) {
          const resultLookupPlace = await lookupPlace(predictions[i].place_id);
          places.push(resultLookupPlace);
        }
        callback(places);
      }
    );
  };

  const lookupPlace = (placeId) => {
    return new Promise((resolve, reject) => {
      placeService.getDetails(
        {
          placeId,
          fields: ["icon", "name", "formatted_address", "geometry.location"],
        },
        (detailPlace) => {
          resolve(detailPlace);
        }
      );
    });
  };

  return {
    map,
    maps,
    search,
    lookupPlace,
  };
}

export default googleMapsAPI;

// class GoogleMapsAPI {
//   setGoogleAPIObject = (map, maps) => {
//     this.map = map;
//     this.maps = maps;
//     this.AutocompleteService = new maps.places.AutocompleteService();
//     this.PlaceService = new maps.places.PlacesService(map);
//   };

//   search = (input, callback) => {
//     this.AutocompleteService.getPlacePredictions(
//       {
//         input,
//       },
//       (predictions) => {
//         if (!predictions) {
//           callback([]);
//           return;
//         }
//         Promise.all(
//           predictions.map((prediction) => {
//             return this.lookupPlace(prediction.place_id);
//           })
//         ).then(callback);
//       }
//     );
//     // only returns a single place
//     // Reference: https://developers.google.com/maps/documentation/javascript/places#place_search_fields
//     // this.PlaceService.findPlaceFromQuery({
//     //   query,
//     //   fields: [
//     //     'icon',
//     //     'name',
//     //     'formatted_address',
//     //     'geometry.location',
//     //   ],
//     // }, callback)
//   };

//   lookupPlace = (placeId) =>
//     new Promise((resolve, reject) => {
//       this.PlaceService.getDetails(
//         {
//           placeId,
//           fields: ["icon", "name", "formatted_address", "geometry.location"],
//         },
//         resolve
//       );
//     });
// }

// const googleMapsInstanceAPI = new GoogleMapsAPI();
// export default googleMapsInstanceAPI;
