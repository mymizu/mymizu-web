import React, { useState, useEffect, useMemo, useRef } from "react";
import GoogleMapReact from "google-map-react";
import axios from "axios";

import { FormattedMessage, IntlProvider } from "react-intl";
import i18nConfig from "./i18nConfig";
import { FunFacts } from "./components";
import Metrics from "./components/Metrics";
import { transformCardData } from "./utils/transformCardData";
import { Modal } from "./components/Modal";
import { useLang } from "./utils/useLang";
import getSlug from "./utils/getSlug";
import { Marker } from "./components/Marker";
import { CurrentLocationIcon } from "./components/CurrentLocationIcon";
import { Search } from "./components/Search";
import { SearchResults } from "./components/SearchResults";
import googleMapAPI from "../utils/googlemaps";
import debounce from "lodash.debounce";
import classnames from "classnames";
import { ShareModal } from "./components/ShareModal";
import CurrentLocationButton from "./components/Buttons/CurrentLocationButton";
import { LANG_PREF_KEY } from "./constants";

const translations = {
  en: require("./translations/en.json"),
  ja: require("./translations/ja.json"),
};

export function App({ gmApiKey, gaTag }) {
  /*useEffect(() => {
    ReactGA.initialize(gaTag);
    ReactGA.send("pageview");
  }, [gaTag])*/


  // Japan Original Location
  const gmDefaultProps = {
    center: {
      lat: 35.662,
      lng: 139.7038,
    },
    zoom: 11,
  };

  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [taps, setTaps] = useState([]);
  const [coordinate, setCoordinate] = useState({});
  const [locale, setLocale] = useState("ja");
  const [detectedLocale, setDetectedLocale] = useState(false);
  const [language] = useLang();
  const [center, setCenter] = useState(gmDefaultProps.center);
  const [zoom, setZoom] = useState(gmDefaultProps.zoom);
  const [cardData, setCardData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [googleMapFn, setGoogleMapFn] = useState();
  const [requestsInProgress, setRequestsInProgress] = useState([]);
  const [isSlideUp, setIsSlideUp] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [showCopyCheck, setShowCopyCheck] = useState(true);
  const [userLatitude, setUserLatitude] = useState(0);
  const [userLongitude, setUserLongitude] = useState(0);
  const [currentLocationLoaded, setCurrentLocationLoaded] = useState(false);

  const queuedTapsRequestRef = useRef(null);
  const ongoingTapsRequestRef = useRef(null);

  const REFILL_SPOT_ROUTE = "/refill/"; // TODO: constants

  const handleSearchQuery = (query) => {
    googleMapFn.search(query, searchResultCallback);
  };

  const handleReset = () => {
    setQuery("");
    setResults([]);
  };

  const searchResultCallback = (results) => {
    setResults(results || []);
  };

  const handleResultClick = (result) => {
    /*ReactGA.event({
      category: 'Search',
      action: 'Clicked search result',
      label: result.formatted_address,
    });*/
    const { location } = result.geometry;

    const resultLat = String(location.lat()).slice(0, 6);
    const resultLng = String(location.lng()).slice(0, 7);

    const newPlaces = taps.map((tap) => {
      const tapLat = String(tap.latitude).slice(0, 6);
      const tapLng = String(tap.longitude).slice(0, 7);
      if (
        resultLat === tapLat &&
        resultLng === tapLng &&
        tap.category_id === 4
      ) {
        return {
          ...tap,
          isSearch: true,
        };
      }
      return {
        ...tap,
        isSearch: false,
      };
    });

    googleMapFn.map.setCenter(result.geometry.location);
    setTaps(newPlaces);
    setResults([]);
    if (Object.keys(coordinate).length > 0) {
      getTapsWhenMapsMoved(coordinate);
    }
  };

  const USER_TOKEN_KEY = "userToken";
  const USER_TOKEN_SET_AT = "userTokenSetAt";
  const USER_TOKEN_EXPIRES_AT = "userTokenExpiresAt";

  const updateLanguage = (language, reload = false) => {
    setDetectedLocale(true);
    setLocale(language);
    axios.defaults.headers.common["Accept-Language"] = language;
    if (reload) {
      // todo: remove if can get map to reload with new language

      location.reload();
    }
  };

  const topNav = [
    {
      id: "topnav.map",
      href: {
        en: "https://mymizu.co/en/mymizu-web",
        ja: "https://mymizu.co/ja/mymizu-web",
      },
    },
    {
      id: "topnav.about",
      href: {
        en: "https://www.mymizu.co/home-en",
        ja: "https://mymizu.co",
      },
    },
    {
      id: "topnav.community",
      href: {
        en: "https://www.mymizu.co/en/business",
        ja: "https://www.mymizu.co/business",
      },
    },
    {
      id: "topnav.partners",
      href: {
        en: "https://github.com/mymizu/mymizu-web",
        ja: "https://github.com/mymizu/mymizu-web/",
      },
    },
    {
      id: "topnav.feedback",
      href: {
        en: "https://go.mymizu.co/web-app-feedback-en",
        ja: "https://go.mymizu.co/web-app-feedback-ja",
      },
    },
  ];

  const socialNav = [
    { href: "https://www.instagram.com/mymizu.co/", iconName: "bi-instagram" },
    { href: "https://www.facebook.com/mymizu.co/", iconName: "bi-facebook" },
    { href: "https://www.twitter.com/mymizuco/", iconName: "bi-twitter" },
  ];

  const footerNav = [
    {
      id: "footernav.joinus",
      href: {
        en: "https://www.mymizu.co/action-app-en",
        ja: "https://www.mymizu.co/action-app-ja",
      },
    },
    {
      id: "footernav.supporters",
      href: {
        en: "https://www.mymizu.co/partners-en",
        ja: "https://www.mymizu.co/partners-ja",
      },
    },
    {
      id: "footernav.contact",
      href: {
        en: "https://www.mymizu.co/contact-us-en",
        ja: "https://www.mymizu.co/contact-us-ja",
      },
    },
    {
      id: "footernav.policy",
      href: {
        en: "https://legal.mymizu.co/privacy",
        ja: "https://legal.mymizu.co/privacy",
      },
    },
    {
      id: "footernav.terms",
      href: {
        en: "https://legal.mymizu.co/terms",
        ja: "https://legal.mymizu.co/terms",
      },
    },
  ];

  const handleNav = () => {
    setNavOpen(!navOpen);
  };

  const getUserToken = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/authorize");
      const token = res.data.new_token;
      setUserToken(token);
      localStorage.setItem(USER_TOKEN_KEY, token);
      localStorage.setItem(
        USER_TOKEN_EXPIRES_AT,
        new Date(Date.now() + 3600 * 1000 * 24 * 365).toString()
      );
      localStorage.setItem(USER_TOKEN_SET_AT, new Date().toString());

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setInitialLoad(true);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log("error", e);
      /*ReactGA.exception({
        description: 'Error loading user token',
        fatal: true
      });*/
    }
  };

  const getInitialTaps = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/get-initial-markers");

      const { taps } = res.data;

      const newTaps = taps
        ? taps.map((tap) => {
            return {
              ...tap,
              isSearch: false,
            };
          })
        : [];

      setInitialLoad(true);
      setTaps(newTaps);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setInitialLoad(true);
      console.log("error", e);
      /*ReactGA.exception({
        description: 'Error loading initial taps',
      });*/
    }
  };

  const getTapsWhenMapsMoved = async (value) => {
    try {
      if (initialLoad) {
        setLoading(true);

        const { nw, se } = value;

        const res = await axios.get(
          `/get-marker-moving-map?c1=${nw.lat}&c2=${nw.lng}&c3=${se.lat}&c4=${se.lng}`
        );

        const { taps: resTaps } = res.data;

        const newTaps = [];

        for (let i = 0; i < resTaps.length; i++) {
          let flag = false;
          for (let j = 0; j < taps.length; j++) {
            if (resTaps[i].id === taps[j].id) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            newTaps.push(resTaps[i]);
          }
        }

        setTaps((currentTaps) => [...currentTaps, ...newTaps]);
        setLoading(false);
      }
    } catch (e) {
      console.log(e);

      /*  ReactGA.exception({
        description: 'Error loading secondary taps',
      });*/
    }
  };

  const fetchQueuedTapsRequestIfAllowed = () => {
    if (queuedTapsRequestRef.current && !ongoingTapsRequestRef.current) {
      ongoingTapsRequestRef.current = queuedTapsRequestRef.current;
      queuedTapsRequestRef.current = null;
      getTapsWhenMapsMoved(ongoingTapsRequestRef.current).then(() => {
        ongoingTapsRequestRef.current = null;
        fetchQueuedTapsRequestIfAllowed();
      });
    }
  };

  const enqueueTapsRequest = (region) => {
    queuedTapsRequestRef.current = region.bounds;
    fetchQueuedTapsRequestIfAllowed();
  };

  const handleDebounce = useMemo(() => {
    return debounce((value) => setCoordinate(value.bounds), 1500);
  }, []);

  const onMarkerClick = (key, childProps) => {
    const markerData = childProps.tap;
    /*ReactGA.event({
      category: 'Refill Spot',
      action: 'Clicked spot marker',
      label: markerData.id,
    });*/
    if (childProps.id == "current_location_icon") {
      return;
    };
    const path = `/refill/${locale}/${markerData.slug}`;
    //ReactGA.send({ hitType: "pageview", page: path});
    document.title = `${markerData.name} - mymizu`;
    window.history.pushState(`refillSpot${markerData.id}`, "", path);
    setCardData(transformCardData(markerData, locale));
    setShowCopyCheck(true);
  };

  const handleCloseModal = () => {
    setCardData(null);
  };

  // Ask user for permission to give device location
  const getGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const slug = getSlug(REFILL_SPOT_ROUTE);
        if (slug !== "") {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setZoom(16);
        }
        setUserLatitude(position.coords.latitude);
        setUserLongitude(position.coords.longitude);
        setCurrentLocationLoaded(true);
      })
    } else {
      setCenter(gmDefaultProps.center);
      setZoom(gmDefaultProps.zoom);
      setCurrentLocationLoaded(false);
    }
  };

  const buttonResetLocation = () => {
    let lat = center.lat;
    let lng = center.lng;
    setZoom(zoom + .00001)
    setCenter({lat: lat + .00001, lng: lng + .00001});
    getGeoLocation();
  }

  // Get geolocation onload
  useEffect(() => {
    getGeoLocation();
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN_KEY);

    if (token) {
      setUserToken(token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return;
    }
    getUserToken();
  }, []);

  useEffect(() => {
    const language = window.navigator.userLanguage || window.navigator.language;
    const userLanguage = localStorage.getItem(LANG_PREF_KEY);

    // Check if 'en' or 'ja' sub-strings are in the default's language: should handle
    // particular cases such as en-GB, en-US, etc.

    if (userLanguage) {
      updateLanguage(userLanguage);
    } else {
      if (language.includes("en")) {
        updateLanguage("en");
      } else if (language.includes("ja")) {
        updateLanguage("ja");
      } else {
        updateLanguage(i18nConfig.defaultLocale);
      }
    }
  }, []);

  useEffect(() => {
    if (!taps.length && !initialLoad && locale && userToken) {
      getInitialTaps();
    }
  }, [taps, setInitialLoad, initialLoad, setTaps, locale, userToken]);

  useEffect(() => {
    localStorage.setItem(LANG_PREF_KEY, locale);
  }, [locale]);

  useEffect(() => {
    if (userToken) {
      const load = async () => {
        const slug = getSlug(REFILL_SPOT_ROUTE);
        if (slug) {
          const res = await axios.get(`/get-refill-spot/${slug}`);
          setCardData(transformCardData(res.data, locale));
          document.title = `${res.data.name} - mymizu`;
          const newTaps = [];
          let flag = false;
          for (let j = 0; j < taps.length; j++) {
            if (res.data.id === taps[j].id) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            newTaps.push(res.data);
          }
          setTaps((currentTaps) => [...currentTaps, ...newTaps]);

          setInitialLoad(true);

          setCenter({
            lat: res?.data?.latitude ?? gmDefaultProps.center.lng,
            lng: res?.data?.longitude ?? gmDefaultProps.center.lng,
          });
          setZoom(16);
        }
      };
      load();
    }
  }, [userToken]);

  return (
    <IntlProvider
      messages={translations[locale]}
      locale={locale}
      defaultLocale={i18nConfig.defaultLocale}
    >
      <div>
        {/* Header */}
        <nav className="navbar navbar-expand-lg bg-light">
          <div className="container-fluid nav-container">
            <img
              id="logo"
              src="/public/images/logo.svg"
              alt=""
              height="45"
              className="d-inline-block align-text-top"
            />
            <div
              className="collapse navbar-collapse justify-content-end"
              id="navbarNav"
            >
              <ul className="nav navbar-nav " style={{ marginTop: 10 }}>
                {topNav.map((el, i) => (
                  <li className="nav-item" key={i}>
                    <a className="nav-link" href={el.href[locale]} key={i}>
                      <FormattedMessage id={el.id} defaultMessage="" />
                    </a>
                  </li>
                ))}
                <li className="nav-item lang-selector">
                  {locale !== "ja" && (
                    <a
                      className="nav-link"
                      href="#"
                      onClick={() => updateLanguage("ja", true)}
                      hrefLang="ja"
                    >
                      日本語
                    </a>
                  )}
                  {locale !== "en" && (
                    <a
                      className="nav-link"
                      href="#"
                      hrefLang="en"
                      onClick={() => updateLanguage("en", true)}
                    >
                      English
                    </a>
                  )}
                </li>
              </ul>
            </div>
            <button
              className="navbar-toggler"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span
                className="hamburger d-sm-inline d-md-inline d-lg-none"
                onClick={handleNav}
              >
                &#9776;
              </span>
            </button>
          </div>
        </nav>
      </div>
      <div className="maps-container">
        <CurrentLocationButton onClick={buttonResetLocation} />
        {detectedLocale && userToken && <GoogleMapReact
          bootstrapURLKeys={{
            key: gmApiKey,
            language: locale,
            region: locale,
            libraries: ["places"],
          }}
          center={center}
          zoom={zoom}
          onChange={enqueueTapsRequest}
          defaultCenter={gmDefaultProps.center}
          defaultZoom={gmDefaultProps.zoom}
          onGoogleApiLoaded={({map, maps}) => {
            setGoogleMapFn(googleMapAPI(map, maps));
          }}
          yesIWantToUseGoogleMapApiInternals
          onChildClick={onMarkerClick}
          options={{
            fullscreenControl: false,
          }}
        >
          {taps.length
            ? taps.map((tap) => (
              <Marker
                key={tap.id}
                lat={tap.latitude}
                lng={tap.longitude}
                category={tap.category_id}
                tap={tap}
              />
            ))
            : null}
            {currentLocationLoaded &&
            <CurrentLocationIcon
              lat={userLatitude}
              lng={userLongitude}
              id="current_location_icon"
            />
            }
        </GoogleMapReact>}
        {cardData && (
          <div
            className={classnames("modal-container", {
              ["modal-container-slide-up"]: isSlideUp,
            })}
          >
            {/* TODO: properly calculate height */}
            <Modal
              cardData={cardData}
              onClose={handleCloseModal}
              isSlideUp={isSlideUp}
              setIsSlideUp={setIsSlideUp}
              setShareModal={setShowShareModal}
            />
            {showShareModal ? (
              <div className="share-modal-container">
                <ShareModal data={cardData} setShareModal={setShowShareModal} setShowCopyCheck={setShowCopyCheck} showCopyCheck={showCopyCheck}/>
              </div>
            ) : (
              ""
            )}
          </div>
        )}
        {taps.length > 0 && (
          <>
            <Search
              results={results}
              onSearch={handleSearchQuery}
              onReset={handleReset}
            />
            <SearchResults
              results={results}
              onSearchResultClick={handleResultClick}
            />
          </>
        )}
      </div>
      <div className="loading-container">
        {loading && (
          <div className="loading-indicator">&nbsp;</div>
        )}
      </div>
      <div className="container-lg">
        {userToken && <Metrics />}
        <FunFacts />
      </div>
      <div className="footer">
        <div className="container-lg">
          <footer>
            <ul className="nav justify-content-center">
              {socialNav.map((el, i) => (
                <li className="nav-item" key={i}>
                  <a href={el.href} className="nav-link px-2 text-muted">
                    <i className={`bi ${el.iconName}`} />
                  </a>
                </li>
              ))}
            </ul>
            <ul className="nav justify-content-center">
              {footerNav.map((el, i) => (
                <li className="nav-item" key={i}>
                  <a href={el.href[locale]} className="nav-link px-2">
                    <FormattedMessage id={el.id} defaultMessage="" />
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </div>
    </IntlProvider>
  );
}
