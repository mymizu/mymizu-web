import React, { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import axios from "axios";
import { transformCardData } from "./utils/transformCardData";
import { Modal } from "./components/Modal";
import { useLang } from "./utils/useLang";

const Marker = ({ category }) => (
  <div className="marker">
    {category === 4 ?  <img className="pin" src="/public/images/map-pin-gold.svg" />: <img className="pin" src="/public/images/map-pin.svg" /> }
  </div>
);

export function App({ gmApiKey, params }) {
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [taps, setTaps] = useState([]);
  const [language] = useLang()

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
    { href: "#", title: "給水MAPの使い方" },
    { href: "#", title: "mymizuについて" },
    { href: "#", title: "コミュニティに参加" },
    { href: "#", title: "mymizuについて" },
    { href: "#", title: "お店にmymizuを紹介" },
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

      const res = await axios.get("/get-initial-markers"); // TODO: pass language as a param
      console.log(res);

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
    console.log("location", window.location)
    console.log("params", params)
  }, [params])

  useEffect(() => {
    if (!taps.length && !initialLoad) {
      getInitialTaps();
    }
  }, [taps, setInitialLoad, initialLoad, setTaps]);

  const [cardData, setCardData] = useState(null)
  const onMarkerClick = (key, childProps) => {
    const markerData = childProps.tap
    setCardData(transformCardData(markerData))

    // debug
    const response = transformCardData(markerData)
    console.group(response)
  };
  const handleCloseModal = () => {
    setCardData(null)
  }

  return (
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
            <ul className="nav" style={{ marginTop: 10 }}>
              {topNav.map((el, i) => (
                <li className="nav-item" key={i}>
                  <a className="nav-link" href={el.href}>
                    {el.title}
                  </a>
                </li>
              ))}
              <li className="nav-item lang-selector">
                <a className="nav-link" href="#">
                  JP
                </a>{" "}
                |{" "}
                <a className="nav-link" href="#">
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
        <div
          className="overlay"
          style={{
            left: navOpen ? "0%" : "-100%",
          }}
        >
          <div className="overlay-content">
            <span className="closebtn" onClick={handleNav}>
              &times;
            </span>
            <div className="nav-container">
              {topNav.map((el, i) => (
                <a href={el.href} key={i}>
                  {el.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div style={{ height: "70vh", width: "100%", position: "relative" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: gmApiKey }}
          defaultCenter={gmDefaultProps.center}
          defaultZoom={gmDefaultProps.zoom}
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
        {cardData && 
        <div style={{ height: "calc(70vh - 64px)", position: "absolute", zIndex:999, top: 32, left: 32, }}>
          {/* TODO: properly calculate height */}
          <Modal cardData={cardData} onClose={handleCloseModal}/>
        </div>
        }
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
                  <a href={el.href} className="nav-link px-2">
                    {el.title}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </div>
    </div>
  );
}
