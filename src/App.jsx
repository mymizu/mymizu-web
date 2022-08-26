import React, { useState, useEffect, useMemo } from "react";
import GoogleMapReact from "google-map-react";
import debounce from "lodash.debounce";
import axios from "axios";
import { transformCardData } from "./utils/transformCardData";
import { Modal } from "./components/Modal";
import { useLang } from "./utils/useLang";
import getSlug from "./utils/getSlug";
import { Marker } from "./components/Marker";

export function App({ gmApiKey }) {
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
  const [language] = useLang();
  const [center, setCenter] = useState(gmDefaultProps.center);
  const [cardData, setCardData] = useState(null);

  const handleNav = () => {
    setNavOpen(!navOpen);
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

  const getTapsWhenMapsMoved = async (value) => {
    try {
      if (initialLoad) {
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

        setTaps([...taps, ...newTaps]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDebounce = useMemo(() => {
    return debounce((value) => setCoordinate(value.bounds), 1500);
  }, []);
  
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
    if (Object.keys(coordinate).length > 0) {
      getTapsWhenMapsMoved(coordinate);
    }
  }, [coordinate]);
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
  }, []);

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
          onChange={handleDebounce}
          center={center}
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
            <Modal cardData={cardData} onClose={handleCloseModal} />
          </div>
        )}
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
