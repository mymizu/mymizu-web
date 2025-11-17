import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import DropdownButton from "./Buttons/DropdownButton";

export const Details = ({ data }) => {
  const intl = useIntl();

  /*code that determines the year that the refill partner joined mymizu and stores it in the variable "year"*/
  date = new Date(data.createdAt);
  const year = date.getFullYear();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const LANG_PREF_KEY = "userLanguage";
  const locale = localStorage.getItem(LANG_PREF_KEY);
  const DAYS = {
    en: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    ja: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
  };
  const dayIndex = new Date().getDay();
  const todayName = DAYS[locale][dayIndex];
  const opening = data.openingHours[todayName];

  const onClickLink = () => {
    /*ReactGA.event({
      category: 'Refill Spot',
      action: 'Clicked spot url',
      label: markerData.id,
    });*/
  };
  return (
    <div>
      <div className="border-blue"></div>
      {data.refillMethod && (
        <div className="detail-section">
          <img src="/public/images/cup.svg" alt="" />
          <div>{data.refillMethod}</div>
        </div>
      )}
      {data.location && (
        <div className="detail-section">
          <img src="/public/images/mymizu_find_large.png" alt="" />
          <div>{data.location}</div>
        </div>
      )}
      {data.openingHours && (
        <div className="detail-section">
          <img src="/public/images/clock.svg" alt="" />
          <div>
            {dropdownOpen ? (
              <p>
                <strong>
                  <FormattedMessage id="today" values={{ day: todayName }} />
                </strong>{" "}
                {opening}
              </p>
            ) : (
              <div>
                <strong>
                  <FormattedMessage id="today" values={{ day: todayName }} />
                </strong>{" "}
                {opening}
              </div>
            )}
            {dropdownOpen && (
              <>
                {Object.keys(data.openingHours).map((key, keyIdx) => (
                  <div className="place-open-section" key={keyIdx}>
                    <p className="place-open-day">{key}</p>
                    <p>{data.openingHours[key][0]}</p>
                  </div>
                ))}
              </>
            )}
          </div>
          <DropdownButton
            dropdownOpen={dropdownOpen}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
        </div>
      )}
      {data.link && (
        <div className="detail-section">
          <img src="/public/images/globe.svg" alt="" />
          <div>
            <a
              href={data.link}
              onClick={onClickLink}
              rel="noopener nofollow"
              target="_blank"
            >
              {data.link}
            </a>
          </div>
        </div>
      )}
      {data.address && (
        <div className="detail-section">
          <img src="/public/images/pin_drop.svg" alt="" />
          <div>{data.address}</div>
        </div>
      )}
      {data.createdAt && data.categoryId === 4 && (
        <div className="detail-section">
          <img src="/public/images/handshake.svg" alt="" />
          <FormattedMessage id="spot.addedSince" values={{ year: year }} />
        </div>
      )}
      <div className="detail-section">
        <img src="/public/images/info.svg" alt="" />
        <div>
          <a
            href={
              intl.locale === "en"
                ? `https://docs.google.com/forms/d/e/1FAIpQLSeRNzWZhQ7jBGzZQOJS4sHt1s4MUR6cf2AinT5ujioLJChPYQ/viewform?usp=pp_url&entry.2092238618=${data.id}`
                : `https://docs.google.com/forms/d/e/1FAIpQLSe0sjbGYk-jJAOxhTFd6eWGWxLbsidYWK4VMPyVmDPx7UGlFQ/viewform?usp=pp_url&entry.2092238618=${data.id}`
            }
            target="_new"
          >
            <FormattedMessage id="spot.report" />
          </a>
        </div>
      </div>
    </div>
  );
};
