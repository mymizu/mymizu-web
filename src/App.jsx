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
import { fetchPublicClusters, fetchPublicTaps } from "./utils/publicApi";
import getSlug from "./utils/getSlug";
import { spotTitle } from "./utils/spotTitle";
import { SocialIcon } from "./components/SocialIcon";
import { Marker } from "./components/Marker";
import { ClusterMarker } from "./components/ClusterMarker";
import { CurrentLocationIcon } from "./components/CurrentLocationIcon";
import { Search } from "./components/Search";
import { SearchResults } from "./components/SearchResults";
import { CategoryFilter } from "./components/CategoryFilter";
import googleMapAPI from "../utils/googlemaps";
import debounce from "lodash.debounce";
import classnames from "classnames";
import { ShareModal } from "./components/ShareModal";
import CurrentLocationButton from "./components/Buttons/CurrentLocationButton";
import { LANG_PREF_KEY } from "./constants";
import { languageFromPath, pathForLanguage } from "./utils/languagePath";
import { getClusterNodes, shouldShowClusters, getLevelsForCategory, getZoomToRevealNextLevel } from "./utils/clusters";

const translations = {
  en: require("./translations/en.json"),
  ja: require("./translations/ja.json"),
};

// coolingShelters: the seasonal shelter layer. Off by default so a bundle that
// somehow renders without the server's value shows the safe thing; the server
// stamps the real value into the page (see server/config.js).
export function App({ gmApiKey, gaTag, coolingShelters = false, initialLocale }) {
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

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [taps, setTaps] = useState([]);
  const [coordinate, setCoordinate] = useState({});
  // A refill spot URL names its language, and the server renders the page in
  // it; starting from the same one keeps hydration in step with that HTML.
  // Everywhere else the server renders Japanese, and the effect below picks
  // the visitor's language once the page has loaded.
  const [locale, setLocale] = useState(initialLocale || "ja");
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
  const [userLatitude, setUserLatitude] = useState(0);
  const [userLongitude, setUserLongitude] = useState(0);
  const [currentLocationLoaded, setCurrentLocationLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [clusterTree, setClusterTree] = useState(null);
  // Set once the first map tiles have drawn. The cluster tree waits for it:
  // see the effect that fetches it.
  const [mapPainted, setMapPainted] = useState(false);
  const clustersRequestedRef = useRef(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [activeTapId, setActiveTapId] = useState(null);

  const queuedTapsRequestRef = useRef(null);
  const ongoingTapsRequestRef = useRef(null);

  const REFILL_SPOT_ROUTE = "/refill/"; // TODO: constants
  const ZOOM_STEP_DELAY_MS = 120;

  const flyTo = (target, targetZoom, onComplete) => {
    if (!googleMapFn?.map || !googleMapFn?.maps || !target) {
      return false;
    }
    const { map, maps } = googleMapFn;

    const stepZoom = (current) => {
      if (current === targetZoom) {
        onComplete && onComplete();
        return;
      }
      const next = current < targetZoom ? current + 1 : current - 1;
      maps.event.addListenerOnce(map, "zoom_changed", () => {
        setTimeout(() => stepZoom(next), ZOOM_STEP_DELAY_MS);
      });
      map.setZoom(next);
    };

    map.panTo(target);
    maps.event.addListenerOnce(map, "idle", () => stepZoom(map.getZoom()));

    return true;
  };

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
    const lat = location.lat();
    const lng = location.lng();

    const resultLat = String(lat).slice(0, 6);
    const resultLng = String(lng).slice(0, 7);

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

    setCenter({ lat, lng });
    setZoom(17);
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
      // Saved here rather than left to the effect on `locale`, which may not
      // run before the page unloads.
      localStorage.setItem(LANG_PREF_KEY, language);

      // todo: remove if can get map to reload with new language
      // A refill spot page names its language in the URL, so open the same
      // spot in the new language rather than reloading the old address.
      const path = pathForLanguage(window.location.pathname, language);
      if (path) {
        window.location.assign(path + window.location.search + window.location.hash);
      } else {
        location.reload();
      }
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
    { href: "https://www.instagram.com/mymizu.co/", icon: "instagram", label: "Instagram" },
    { href: "https://www.facebook.com/mymizu.co/", icon: "facebook", label: "Facebook" },
    { href: "https://www.twitter.com/mymizuco/", icon: "twitter", label: "Twitter" },
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

        // Straight from the API's edge where the view is small enough (see
        // utils/publicApi), otherwise through this server as before.
        const direct = await fetchPublicTaps(
          { c1: nw.lat, c2: nw.lng, c3: se.lat, c4: se.lng },
          { cooling: coolingShelters }
        );
        const resTaps = direct
          ? direct.taps
          : (
              await axios.get(
                `/get-marker-moving-map?c1=${nw.lat}&c2=${nw.lng}&c3=${se.lat}&c4=${se.lng}`
              )
            ).data.taps;

        setTaps((currentTaps) => {
          const existingIds = new Set(currentTaps.map((tap) => tap.id));
          const newTaps = (resTaps || []).filter(
            (tap) => !existingIds.has(tap.id)
          );
          return newTaps.length ? [...currentTaps, ...newTaps] : currentTaps;
        });
        setLoading(false);
      }
    } catch (e) {
      console.log(e);

      /*  ReactGA.exception({
        description: 'Error loading secondary taps',
      });*/
    }
  };

// Feature: Not working yet, error on server side, but we can use this to fetch all clusters and cache them on the client side
  const fetchClusters = async () => {
    try {
      // Straight from the API's edge (see utils/publicApi), otherwise through
      // this server.
      const direct = await fetchPublicClusters();
      if (direct) {
        setClusterTree(direct);
        return;
      }
      const res = await axios.get("/get-clusters", {
        headers: userToken ? { Authorization: `Bearer ${userToken}` } : {},
      });
      setClusterTree(res.data);
    } catch (e) {
      // Let the next zoom or pan try again.
      clustersRequestedRef.current = false;
      console.log("error fetching clusters", e);
    }
  };
//*
  const fetchQueuedTapsRequestIfAllowed = () => {
    // getTapsWhenMapsMoved() no-ops until initialLoad is set, and this used to
    // clear the queue before calling it — so any map movement before the first
    // load completed was silently thrown away. That race existed before, but
    // mounting the map without waiting for the token widens the window, so hold
    // the bounds until we are actually able to use them.
    if (!initialLoad) return;

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
    // Queued before the state updates: called from a Maps event, outside
    // React's batching, each setState re-renders synchronously and runs any
    // pending effects. If one of those sets initialLoad, its replay must
    // already find these bounds, or they are dropped (this closure's
    // initialLoad is the old one) and the map shows no taps.
    queuedTapsRequestRef.current = region.bounds;
    setZoom(region.zoom);
    setMapBounds(region.bounds);
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

    if (childProps.isCluster) {
      const { lat, lng, level } = childProps;
      const targetZoom = getZoomToRevealNextLevel(level, zoom);
      const target = { lat, lng };

      const started = flyTo(target, targetZoom, () => {
        setCenter(target);
        setZoom(targetZoom);
      });

      if (!started) {
        setCenter(target);
        setZoom(targetZoom);
      }
      return;
    }

    const path = `/refill/${locale}/${markerData.slug}`;
    //ReactGA.send({ hitType: "pageview", page: path});
    document.title = spotTitle(markerData, locale);
    window.history.pushState(`refillSpot${markerData.id}`, "", path);
    setCardData(transformCardData(markerData, locale));
    setActiveTapId(markerData.id);
    setCenter({ lat: markerData.latitude, lng: markerData.longitude });
  };

  const handleCloseModal = () => {
    setCardData(null);
    setShowShareModal(false);
    setActiveTapId(null);
  };

  // Ask user for permission to give device location
  const getGeoLocation = (forceRecenter = false) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const slug = getSlug(REFILL_SPOT_ROUTE);

          setUserLatitude(latitude);
          setUserLongitude(longitude);
          setCurrentLocationLoaded(true);

          if (slug !== "" || forceRecenter) {
            const target = { lat: latitude, lng: longitude };
            const targetZoom = 16;

            const started = flyTo(target, targetZoom, () => {
              setCenter(target);
              setZoom(targetZoom);
            });

            if (!started) {
              setCenter(target);
              setZoom(targetZoom);
            }
          }
        },
        (error) => {
          console.log("geolocation error", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setCenter(gmDefaultProps.center);
      setZoom(gmDefaultProps.zoom);
      setCurrentLocationLoaded(false);
    }
  };

  const buttonResetLocation = () => {
    getGeoLocation(true);
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
    // A refill spot link says which language it is in (/refill/ja/...), and
    // that wins: someone opening a shared or searched-for link sees the page
    // in the language of the URL, and the URL never disagrees with the page.
    const urlLanguage = languageFromPath(window.location.pathname);

    // Check if 'en' or 'ja' sub-strings are in the default's language: should handle
    // particular cases such as en-GB, en-US, etc.

    if (urlLanguage) {
      updateLanguage(urlLanguage);
    } else if (userLanguage) {
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

  // Once the first load lands, replay whatever bounds the user moved to while
  // it was still in flight.
  useEffect(() => {
    if (initialLoad) {
      fetchQueuedTapsRequestIfAllowed();
    }
  }, [initialLoad]);

  // "Tiles loaded" means fetched, not yet drawn: the map still fades them in,
  // and the main thread may be busy. Starting the 3.5MB download then still
  // put it in front of the paint on a slow phone, so wait until the browser
  // is idle as well (with a cap, so a page that never idles still gets it).
  const onFirstTilesLoaded = () => {
    if (mapPainted) return;
    const whenIdle =
      window.requestIdleCallback || ((fn) => setTimeout(fn, 1000));
    whenIdle(() => {
      setMapPainted(true);
      // Tells the page's analytics snippet it can load now (server.jsx).
      window.dispatchEvent(new window.Event("mymizu:map-painted"));
    }, { timeout: 3000 });
  };

  // The cluster tree is every cluster at every level: ~3.5MB compressed and
  // ~16MB of JSON to parse. Fetched at page load it shared the connection
  // with the map tiles and then held the main thread while it was parsed, so
  // on a phone the map (the largest paint) waited for it. It is now asked for
  // only once the first tiles have drawn, and only when the map is zoomed out
  // far enough to show clusters: a refill spot page opens at street level,
  // where it shows individual taps and never needs the tree unless the
  // visitor zooms out.
  useEffect(() => {
    if (clusterTree || clustersRequestedRef.current) return;
    if (!mapPainted || !shouldShowClusters(zoom)) return;
    clustersRequestedRef.current = true;
    fetchClusters();
  }, [mapPainted, zoom, clusterTree]);

  useEffect(() => {
    localStorage.setItem(LANG_PREF_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  // Opens the card for the spot a /refill/... URL names, and centres the map
  // on it.
  const showInitialSpot = (data) => {
    setCardData(transformCardData(data, locale));
    setActiveTapId(data.id);
    document.title = spotTitle(data, locale);
    setTaps((currentTaps) =>
      currentTaps.some((tap) => tap.id === data.id)
        ? currentTaps
        : [...currentTaps, data]
    );
    setCenter({
      lat: data?.latitude ?? gmDefaultProps.center.lat,
      lng: data?.longitude ?? gmDefaultProps.center.lng,
    });
    setZoom(16);
  };

  // The server puts the spot in the page (window.__SPOT__), so the card and
  // the map's starting position no longer wait for a token and a second fetch.
  // Run in the same pass as the locale effect, the map mounts already centred
  // on the spot, rather than loading the default view's tiles and then
  // moving. Without the inline copy (an old cached page, a failed lookup) it
  // is fetched once the token is there, as before.
  const initialSpotRef = useRef(false);
  useEffect(() => {
    if (initialSpotRef.current) return;
    const slug = getSlug(REFILL_SPOT_ROUTE);
    if (!slug) return;

    const inline = window.__SPOT__;
    if (inline && inline.slug === slug) {
      initialSpotRef.current = true;
      showInitialSpot(inline);
      return;
    }
    if (!userToken) return;

    initialSpotRef.current = true;
    axios
      .get(`/get-refill-spot/${slug}`)
      .then((res) => showInitialSpot(res.data))
      .catch((e) => console.log("error fetching refill spot", e));
  }, [userToken]);

  // Marker requests carry the token, so the first load still waits for it,
  // and for the spot to be on the map.
  useEffect(() => {
    if (initialSpotRef.current && userToken && cardData) {
      setInitialLoad(true);
    }
  }, [userToken, cardData]);

  const visibleTaps = useMemo(() => {
    if (categoryFilter === "cooling") {
      return taps.filter((tap) => tap.category_id === 6);
    }
    if (categoryFilter === "water") {
      return taps.filter((tap) => tap.category_id !== 6);
    }
    return taps;
  }, [taps, categoryFilter]);

  // `all` counts cooling shelters; `water` is the same tree without them. With
  // the layer off the markers exclude shelters, so the cluster totals have to
  // as well or they overstate what zooming in will reveal.
  const clusterCategoryKey =
    categoryFilter || (coolingShelters ? "all" : "water");

  const hasClusterDataForCategory = useMemo(
    () =>
      Object.keys(getLevelsForCategory(clusterTree, clusterCategoryKey))
        .length > 0,
    [clusterTree, clusterCategoryKey]
  );

  const showClusters = shouldShowClusters(zoom) && !!clusterTree && hasClusterDataForCategory;

  const clusterNodes = useMemo(() => {
    if (!showClusters) {
      return [];
    }
    return getClusterNodes(clusterTree, clusterCategoryKey, zoom, mapBounds);
  }, [showClusters, clusterTree, clusterCategoryKey, zoom, mapBounds]);

  return (
    <IntlProvider
      messages={translations[locale]}
      locale={locale}
      defaultLocale={i18nConfig.defaultLocale}
    >
      <header>
        {/* The first thing Tab reaches: past the nav links and straight to
            the map and search. Shown only while it has focus. */}
        <a className="skip-link visually-hidden-focusable" href="#main-content">
          <FormattedMessage id="skip.main" />
        </a>
        <nav className="navbar navbar-expand-lg bg-light">
          <div className="container-fluid nav-container">
            <a href="/" className="logo-link">
              <img
                id="logo"
                src="/public/images/logo.svg"
                alt="mymizu"
                height="45"
                className="d-inline-block align-text-top"
              />
            </a>
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
                      onClick={(e) => {
                        // Stop the "#" navigation, which could cancel the page change.
                        e.preventDefault();
                        updateLanguage("ja", true);
                      }}
                      hrefLang="ja"
                      lang="ja"
                    >
                      日本語
                    </a>
                  )}
                  {locale !== "en" && (
                    <a
                      className="nav-link"
                      href="#"
                      hrefLang="en"
                      lang="en"
                      onClick={(e) => {
                        // Stop the "#" navigation, which could cancel the page change.
                        e.preventDefault();
                        updateLanguage("en", true);
                      }}
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
              aria-controls="navbarNav"
              aria-label={translations[locale]["nav.toggle"]}
            >
              <span className="hamburger d-sm-inline d-md-inline d-lg-none">
                &#9776;
              </span>
            </button>
          </div>
        </nav>
      </header>
      {/* tabIndex so the skip link moves focus here, not just the scroll. */}
      <main id="main-content" tabIndex={-1}>
      <h1 className="visually-hidden">
        <FormattedMessage id="page.heading" />
      </h1>
      <div className="maps-container">
        <CurrentLocationButton onClick={buttonResetLocation} />
        {/* Deliberately not gated on userToken. The map itself needs no auth —
            only the markers do — and waiting for /api/authorize put a ~780ms
            round trip (for a 356-byte token) directly in front of the 385KB
            Google Maps script, which is the LCP element on mobile. The marker
            pipeline stays gated: getTapsWhenMapsMoved() only runs once
            initialLoad is set, which still requires the token. */}
        {detectedLocale && <GoogleMapReact
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
          onTilesLoaded={onFirstTilesLoaded}
          onGoogleApiLoaded={({map, maps}) => {
            setGoogleMapFn(googleMapAPI(map, maps));
          }}
          yesIWantToUseGoogleMapApiInternals
          onChildClick={onMarkerClick}
          options={{
            fullscreenControl: false,
          }}
        >
          {showClusters
            ? clusterNodes.map((node) => (
              <ClusterMarker
                key={`cluster-${clusterCategoryKey}-${node.id}`}
                lat={node.lat}
                lng={node.lng}
                count={node.count}
                category="all"
                bbox={node.bbox}
                level={node.level}
                isCluster
              />
            ))
            : visibleTaps.length
            ? visibleTaps.map((tap) => (
              <Marker
                key={tap.id}
                lat={tap.latitude}
                lng={tap.longitude}
                category={tap.category_id}
                tap={tap}
                isActive={tap.id === activeTapId}
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
            {showShareModal && (
              <ShareModal
                key={cardData.id}
                data={cardData}
                onClose={() => setShowShareModal(false)}
              />
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
            {coolingShelters && (
              <CategoryFilter
                activeCategory={categoryFilter}
                onSelect={setCategoryFilter}
              />
            )}
          </>
        )}
      </div>
      <div className="loading-container">
        {loading && (
          <div className="loading-indicator">&nbsp;</div>
        )}
        {/* Always rendered, so screen readers notice when the text changes. */}
        <div role="status" className="visually-hidden">
          {loading && <FormattedMessage id="loading.spots" />}
        </div>
      </div>
      <div className="container-lg">
        {userToken && <Metrics />}
        <FunFacts />
      </div>
      </main>
      <div className="footer">
        <div className="container-lg">
          <footer>
            <ul className="nav justify-content-center">
              {socialNav.map((el, i) => (
                <li className="nav-item" key={i}>
                  <a href={el.href} className="nav-link px-2 text-muted" aria-label={el.label}>
                    <SocialIcon name={el.icon} />
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
