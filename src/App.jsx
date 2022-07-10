import React, { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import axios from "axios";

const Marker = () => <div className="marker"><img className="pin" src="/public/images/map-pin.svg" /></div>;

export function App({ gmApiKey }) {
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [taps, setTaps] = useState([]);
  const [center, setCenter] = useState(null);

  const handleNav = () => {
    setNavOpen(!navOpen);
  }

  const gmDefaultProps = {
    center: {
      lat: 35.662,
      lng: 139.7038,
    },
    zoom: 11,
  }

  const topNav = [
    { href: "#", title: "給水MAPの使い方" },
    { href: "#", title: "mymizuについて" },
    { href: "#", title: "コミュニティに参加" },
    { href: "#", title: "mymizuについて" },
    { href: "#", title: "お店にmymizuを紹介" },
  ]

  const socialNav = [
    { href: "#", iconName: "bi-instagram" },
    { href: "#", iconName: "bi-facebook" },
    { href: "#", iconName: "bi-twitter" },
  ]

  const footerNav = [
    { href: "#", title: "マイボトルを購入" },
    { href: "#", title: "mymizuサポーター" },
    { href: "#", title: "フィードバックを送信" },
    { href: "#", title: "お問い合わせ" },
  ]

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
  }

  const boundsChanged = async(bounds) => {
      const params = new URLSearchParams([
                                          ['c1', bounds.nw.lat], 
                                          ['c2', bounds.nw.lng], 
                                          ['c3', bounds.se.lat], 
                                          ['c4', bounds.se.lng]]);
      
      try {
        setLoading(true);
        const res = await axios.get("/get-current-markers", { params });
        setTaps(res.data.taps);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log("error", e);
      }
  }

  useEffect(() => {
    if (!taps.length && !initialLoad) {
      getInitialTaps();
    }
  }, [taps, setInitialLoad, initialLoad, setTaps]);

  return (
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
                    <a className="nav-link" href={el.href}>{el.title}</a>
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
              {topNav.map((el, i) => <a href={el.href} key={i}>{el.title}</a>)}
            </div>
          </div>
        </div>
      </nav>

      <div style={{ height: "70vh", width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: gmApiKey }}
          defaultCenter={gmDefaultProps.center}
          defaultZoom={gmDefaultProps.zoom}
          yesIWantToUseGoogleMapApiInternals
          onChange={({ center, zoom, bounds, marginBounds }) => boundsChanged(bounds)}>
          {!loading && taps.length ? taps.map((tap) =>
            <Marker key={tap.id} lat={tap.latitude} lng={tap.longitude} />
          ) : loading && taps.length ? taps.map((tap) =>
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
                      {el.title}
                    </a>
                  </li>
                )
              }
            </ul>
          </footer>
        </div>
      </div>

    </div>
  )
}
