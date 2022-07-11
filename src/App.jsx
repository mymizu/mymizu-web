import React, { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import axios from "axios";
import { FormattedMessage, IntlProvider } from "react-intl";
import i18nConfig from "./i18nConfig";
import { Statistics } from "./components/statistics";

const translations = {
  en: require("./translations/en.json"),
  ja: require("./translations/ja.json")
};

const Marker = () => <div className="marker"><img className="pin" src="/public/images/map-pin.svg" /></div>;

export function App({ gmApiKey }) {
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [taps, setTaps] = useState([]);
  const [locale, setLocale] = useState("ja");

  const handleNav = () => {
    setNavOpen(!navOpen);
  };

  const gmDefaultProps = {
    center: {
      lat: 35.662,
      lng: 139.7038,
    },
    zoom: 11,
  };

  const topNav = [
    { id: "topnav.map", href: "https://mymizu.co/en/how-to", title: "給水MAPの使い方" },
    { id: "topnav.about", href: "https://mymizu.co/en-home", title: "mymizuについて" },
    { id: "topnav.community", href: "https://www.mymizu.co/en/business", title: "コミュニティに参加" },
    { id: "topnav.partners", href: "https://github.com/mymizu/mymizu-web", title: "mymizuについて" },
    { id: "topnav.feedback", href: "https://sij3.typeform.com/to/qADeh9", title: "お店にmymizuを紹介" },
  ];

  const socialNav = [
    { href: "https://www.instagram.com/mymizu.co/", iconName: "bi-instagram" },
    { href: "https://www.facebook.com/mymizu.co/", iconName: "bi-facebook" },
    { href: "https://www.twitter.com/mymizuco/", iconName: "bi-twitter" },
  ];

  const footerNav = [
    { id: "footernav.joinus", href: "https://www.mymizu.co/action-app-en", title: "給水MAPの使い方" },
    { id: "footernav.supporters", href: "https://www.mymizu.co/partners-en", title: "mymizuについて" },
    { id: "footernav.contact", href: "https://www.mymizu.co/contact-us-en", title: "コミュニティに参加" },
    { id: "footernav.policy", href: "https://legal.mymizu.co/privacy", title: "mymizuについて" },
    { id: "footernav.terms", href: "https://legal.mymizu.co/terms", title: "お店にmymizuを紹介" },
  ];

  const getInitialTaps = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/get-initial-markers");

      setInitialLoad(true);
      setTaps(res.data.taps);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setInitialLoad(true);
      console.log("error", e);
    }
  };

  useEffect(() => {
    if (!taps.length && !initialLoad) {
      getInitialTaps();
    }
  }, [taps, setInitialLoad, initialLoad, setTaps]);

  const LANG_PREF_KEY = "userLanguage";

  // Initial page load: get browser's default language and init localization
  useEffect(() => {
    const language = window.navigator.userLanguage || window.navigator.language;
    const supportedLanguages = ["en", "ja"];

    // Check if 'en' or 'ja' sub-strings are in the default's language: should handle
    // particular cases such as en-GB, en-US, etc.
    if (language.includes("en")){
      setLocale("en")
    } else if (language.includes("ja")){
      setLocale("ja")
    }
    else{
      // Default language is read from i18nConfig, if browser's is something else
      setLocale(i18nConfig.defaultLocale)
    }

  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_PREF_KEY, locale);
  }, [locale]);

  return (
    <IntlProvider messages={translations[locale]} locale={locale} defaultLocale={i18nConfig.defaultLocale}>
      <div>
        {/* Header */}
        <nav className="navbar navbar-expand-lg bg-light">
          <div className="container-fluid nav-container">
            <img id="logo" src="/public/images/logo.svg" alt="" height="45" className="d-inline-block align-text-top" />
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="nav" style={{ marginTop: 10 }}>
                {
                  topNav.map((el, i) =>
                    <li className="nav-item" key={i}>
                      <a className="nav-link" href={el.href} key={i}>
                        <FormattedMessage
                          id={el.id}
                          defaultMessage="" />
                      </a>
                    </li>
                  )
                }
                <li className="nav-item lang-selector">
                  <a className="nav-link" href="#" onClick={() => setLocale("ja")}>
                    JP
                  </a> |
                  <a className="nav-link" href="#" onClick={() => setLocale("en")}>
                    EN
                  </a>
                </li>
              </ul>
            </div>
            <span className="hamburger d-sm-inline d-md-inline d-lg-none" onClick={handleNav}>&#9776;</span>
          </div>
          <div className="overlay" style={{
            left: navOpen ? "0%" : "-100%",
          }}>
            <div className="overlay-content">
              <span className="closebtn" onClick={handleNav} >&times;</span>
              <div className="nav-container">
                <a href="#" onClick={() => setLocale("ja")}>
                  JP
                </a> |
                <a href="#" onClick={() => setLocale("en")}>
                  EN
                </a>
                {[...topNav, ...footerNav].map((el, i) => (
                  <a href={el.href} key={i}>
                    <FormattedMessage
                      id={el.id}
                      defaultMessage=""
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div style={{ height: "70vh", width: "100%" }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: gmApiKey }}
            defaultCenter={gmDefaultProps.center}
            defaultZoom={gmDefaultProps.zoom}>
            {!loading && taps.length ? taps.map((tap) =>
              <Marker key={tap.id} lat={tap.latitude} lng={tap.longitude} />
            ) : null}
          </GoogleMapReact>
        </div>

        <Statistics />

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
                {
                  footerNav.map((el, i) =>
                    <li className="nav-item" key={i}>
                      <a href={el.href} className="nav-link px-2">
                        <FormattedMessage
                          id={el.id}
                          defaultMessage="" />
                      </a>
                    </li>
                  )
                }
              </ul>

            </footer>
          </div>
        </div>

      </div>
    </IntlProvider>
  )
}
