import React, {useState, useEffect} from "react";
import GoogleMapReact from "google-map-react";
import axios from "axios";
import {FormattedMessage, IntlProvider} from "react-intl";
import i18nConfig from "./i18nConfig";
import {Statistics, FunFacts} from "./components";
import {transformCardData} from "./utils/transformCardData";
import {Modal} from "./components/Modal";
import {useLang} from "./utils/useLang";
import getSlug from "./utils/getSlug";
import {Marker} from "./components/Marker";
import {Search} from "./components/Search";
import {SearchResults} from "./components/SearchResults";
import googleMapAPI from "../utils/googlemaps";

const translations = {
  en: require("./translations/en.json"),
  ja: require("./translations/ja.json"),
};

export function App({gmApiKey}) {
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
  const [locale, setLocale] = useState("ja");
  const [language] = useLang();
  const [center, setCenter] = useState(gmDefaultProps.center);
  const [cardData, setCardData] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [googleMapFn, setGoogleMapFn] = useState();

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
    const {location} = result.geometry;

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
  };

  const LANG_PREF_KEY = "userLanguage";

  const topNav = [
    {
      id: "topnav.map",
      href: "https://mymizu.co/en/how-to",
      title: "給水MAPの使い方",
    },
    {
      id: "topnav.about",
      href: "https://mymizu.co/en-home",
      title: "mymizuについて",
    },
    {
      id: "topnav.community",
      href: "https://www.mymizu.co/en/business",
      title: "コミュニティに参加",
    },
    {
      id: "topnav.partners",
      href: "https://github.com/mymizu/mymizu-web",
      title: "mymizuについて",
    },
    {
      id: "topnav.feedback",
      href: "https://sij3.typeform.com/to/qADeh9",
      title: "お店にmymizuを紹介",
    },
  ];

  const socialNav = [
    {href: "https://www.instagram.com/mymizu.co/", iconName: "bi-instagram"},
    {href: "https://www.facebook.com/mymizu.co/", iconName: "bi-facebook"},
    {href: "https://www.twitter.com/mymizuco/", iconName: "bi-twitter"},
  ];

  const footerNav = [
    {
      id: "footernav.joinus",
      href: "https://www.mymizu.co/action-app-en",
      title: "給水MAPの使い方",
    },
    {
      id: "footernav.supporters",
      href: "https://www.mymizu.co/partners-en",
      title: "mymizuについて",
    },
    {
      id: "footernav.contact",
      href: "https://www.mymizu.co/contact-us-en",
      title: "コミュニティに参加",
    },
    {
      id: "footernav.policy",
      href: "https://legal.mymizu.co/privacy",
      title: "mymizuについて",
    },
    {
      id: "footernav.terms",
      href: "https://legal.mymizu.co/terms",
      title: "お店にmymizuを紹介",
    },
  ];

  const handleNav = () => {
    setNavOpen(!navOpen);
  };

  const getInitialTaps = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/get-initial-markers");

      const {taps} = res.data;

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
    }
  };

  const onMarkerClick = (key, childProps) => {
    const markerData = childProps.tap;
    setCardData(transformCardData(markerData));
  };

  const handleCloseModal = () => {
    setCardData(null);
  };

  useEffect(() => {
    if (!taps.length && !initialLoad) {
      getInitialTaps();
    }
  }, [taps, setInitialLoad, initialLoad, setTaps]);

  useEffect(() => {
    const language = window.navigator.userLanguage || window.navigator.language;
    const userLanguage = localStorage.getItem(LANG_PREF_KEY);

    // Check if 'en' or 'ja' sub-strings are in the default's language: should handle
    // particular cases such as en-GB, en-US, etc.

    if (userLanguage) {
      setLocale(userLanguage);
    } else {
      if (language.includes("en")) {
        setLocale("en");
      } else if (language.includes("ja")) {
        setLocale("ja");
      } else {
        setLocale(i18nConfig.defaultLocale);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_PREF_KEY, locale);
  }, [locale]);

  useEffect(() => {
    const load = async () => {
      const REFILL_SPOT_ROUTE = "/refill_spots/"; // TODO: constants
      const slug = getSlug(REFILL_SPOT_ROUTE);
      if (slug) {
        const res = await axios.get(`/get-refill-spot/${slug}`);
        setCardData(transformCardData(res.data));
        setCenter({
          lat: res?.data?.latitude ?? gmDefaultProps.center.lng,
          lng: res?.data?.longitude ?? gmDefaultProps.center.lng,
        });
      }
    };
    load();
  }, []);

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
              <ul className="nav" style={{marginTop: 10}}>
                {topNav.map((el, i) => (
                  <li className="nav-item" key={i}>
                    <a className="nav-link" href={el.href} key={i}>
                      <FormattedMessage id={el.id} defaultMessage=""/>
                    </a>
                  </li>
                ))}
                <li className="nav-item lang-selector">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={() => setLocale("ja")}
                  >
                    JP
                  </a>{" "}
                  |
                  <a
                    className="nav-link"
                    href="#"
                    onClick={() => setLocale("en")}
                  >
                    EN
                  </a>
                </li>
              </ul>
            </div>
            <span
              className="hamburger d-sm-inline d-md-inline d-lg-none"
              onClick={handleNav}
            >
              &#9776;
            </span>
          </div>
        </nav>

        <div className="maps-container">
          <div style={{height: "70vh", width: "100%", position: "relative"}}>
            <GoogleMapReact
              bootstrapURLKeys={{
                key: gmApiKey,
                language: locale,
                region: locale,
                libraries: ["places"],
              }}
              center={center}
              defaultCenter={gmDefaultProps.center}
              defaultZoom={gmDefaultProps.zoom}
              onGoogleApiLoaded={({ map, maps }) => {
                setGoogleMapFn(googleMapAPI(map, maps));
              }}
              yesIWantToUseGoogleMapApiInternals
              onChildClick={onMarkerClick}
            >
              {!loading && taps.length
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
            </GoogleMapReact>
            {cardData && (
              <div
                style={{
                  height: "calc(70vh - 64px)",
                  position: "absolute",
                  zIndex: 999,
                  top: 32,
                  left: 32,
                }}
              >
                {/* TODO: properly calculate height */}
                <Modal cardData={cardData} onClose={handleCloseModal}/>
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
          <div className="container-lg">
            <Statistics/>

            <FunFacts/>

            <div className="footer">
              <div className="container-lg">
                <footer>
                  <ul className="nav justify-content-center">
                    {socialNav.map((el, i) => (
                      <li className="nav-item" key={i}>
                        <a href={el.href} className="nav-link px-2 text-muted">
                          <i className={`bi ${el.iconName}`}/>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <ul className="nav justify-content-center">
                    {footerNav.map((el, i) => (
                      <li className="nav-item" key={i}>
                        <a href={el.href} className="nav-link px-2">
                          <FormattedMessage id={el.id} defaultMessage=""/>
                        </a>
                      </li>
                    ))}
                  </ul>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IntlProvider>
  );
}
