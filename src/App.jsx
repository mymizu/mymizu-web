import React, { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import axios from "axios";
import { FormattedMessage, IntlProvider } from "react-intl";
import { i18nConfig } from "./i18nConfig";

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
    { id: "topnav.map", href: "#" },
    { id: "topnav.about", href: "#" },
    { id: "topnav.community", href: "#" },
    { id: "topnav.about", href: "#" },
    { id: "topnav.partners", href: "#" },
  ];

  const socialNav = [
    { href: "#", iconName: "bi-instagram" },
    { href: "#", iconName: "bi-facebook" },
    { href: "#", iconName: "bi-twitter" },
  ];

  const footerNav = [
    { href: "#", title: "マイボトルを購入" },
    { href: "#", title: "mymizuサポーター" },
    { href: "#", title: "フィードバックを送信" },
    { href: "#", title: "お問い合わせ" },
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

  // Initial page load: get browser's default language and init localization
  useEffect(() => {
    const language = window.navigator.userLanguage || window.navigator.language;
    const supportedLanguages = ["en", "ja"];

    // Check if 'en' or 'ja' sub-strings are in the default's language: should handle
    // particular cases such as en-GB, en-US, etc.
    if (language.includes('en')){
      setLocale("en")
    }
    else if (language.includes('ja')){
      setLocale("ja")
    }
    else{
      // Default language is read from i18nConfig, if browser's is something else
      setLocale(i18nConfig.default)
    }

  }, []);

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
                  <a className="nav-link" href="#">JP</a> | <a className="nav-link" href="#">EN</a>
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
                {topNav.map((el, i) => (
                  <a href={el.href} key={i}>
                    <FormattedMessage
                      id={el.id}
                      defaultMessage="" />
                  </a>
                )}
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

        <div className="container-lg">
          <div className="row home">
            <div className="col" id="forest">
              Column
            </div>
            <div className="col" id="money">
              Column
            </div>
            <div className="col" id="ocean">
              Column
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="container-lg">
            <footer>
              <ul className="nav justify-content-center">
                {
                  socialNav.map((el, i) =>
                    <li className="nav-item" key={i}>
                      <a href={el.href} className="nav-link px-2 text-muted">
                        <i className={`bi ${el.iconName}`} />
                      </a>
                    </li>
                  )
                }
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
