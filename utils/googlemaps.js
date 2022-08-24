<<<<<<< HEAD
function googleMapsAPI(map, maps) {
  const autoCompleteService = new maps.places.AutocompleteService();
  const placeService = new maps.places.PlacesService(map);
=======
// function googleMapsAPI(map, maps) {
//   const autoCompleteService = new maps.places.AutocompleteService();
//   const placeService = new maps.places.PlacesService(map);

//   const search = (input, callback) => {
//     autoCompleteService.getPlacePredictions(
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
//             return lookupPlace(prediction.place_id);
//           })
//         ).then(callback);
//       }
//     );
//   };

//   const lookupPlace = (placeId) => {
//     new Promise((resolve, reject) => {
//       placeService.getDetails(
//         {
//           placeId,
//           fields: ["icon", "name", "formatted_address", "geometry.location"],
//         },
//         resolve
//       );
//     });
//   };

//   return {
//     map,
//     maps,
//     search,
//     lookupPlace,
//   };
// }

// export default googleMapsAPI;

class GoogleMapsAPI {
  setGoogleAPIObject = (map, maps) => {
    this.map = map;
    this.maps = maps;
    this.AutocompleteService = new maps.places.AutocompleteService();
    this.PlaceService = new maps.places.PlacesService(map);
  };
>>>>>>> 1. modify style on class .maps-location-search-results-container  overflow-y: scroll; 2.Refactor from class to function in googlemap.js but it doesn't work yet

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
