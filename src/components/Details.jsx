import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import DropdownButton from "./Buttons/DropdownButton";
import getDayOfWeek from "../utils/getDayOfWeek";

export const Details = ({ data }) => {
  const intl = useIntl();

  /*code that determines the year that the refill partner joined mymizu and stores it in the variable "year"*/
  date = new Date(data.createdAt);
  const year = date.getFullYear();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const today = getDayOfWeek();

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
      {data.categoryId === 6 && (
        <div className="cooling-shelter-info-box">
          <img src="/public/images/snowflake.png" alt="" />
          <div>
            <p className="cooling-shelter-info-box-title">
              <FormattedMessage id="coolingShelter.infoBox.title" />
            </p>
            <p className="cooling-shelter-info-box-text"><FormattedMessage id="coolingShelter.infoBox.line1" /></p>
            <p className="cooling-shelter-info-box-text"><FormattedMessage id="coolingShelter.infoBox.line2" /></p>
          </div>
        </div>
      )}
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
      {data.categoryId !== 6 && data.openingHours && (
        <div className="detail-section">
          <img src="/public/images/clock.svg" alt="" />
          <div>
            <p className={!dropdownOpen && "place-open-dropdown-closed"}>
              <b>
                <FormattedMessage id="today" values={{ day: today }} />
              </b>{" "}
              {data.openingHours[today]}
            </p>
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
      {/* Cooling shelters: formatted_opening_hours is already localized/formatted
          server-side (day names go through Laravel's translator) — just split on
          "\n" and render, never re-parse the raw string. */}
      {data.categoryId === 6 && data.coolingShelter?.formattedOpeningHours && (
        <div className="detail-section">
          <img src="/public/images/clock.svg" alt="" />
          <div>
            {data.coolingShelter.formattedOpeningHours.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
      )}
      {data.categoryId === 6 && data.coolingShelter?.phone && (
        <div className="detail-section">
          <img src="/public/images/phone.svg" alt="" />
          <div>
            <a href={`tel:${data.coolingShelter.phone}`}>
              {data.coolingShelter.phone}
            </a>
          </div>
        </div>
      )}
      {data.categoryId === 6 && data.coolingShelter?.capacity != null && (
        <div className="detail-section">
          <img src="/public/images/info.svg" alt="" />
          <div>
            <FormattedMessage
              id="coolingShelter.capacity"
              values={{ capacity: data.coolingShelter.capacity }}
            />
          </div>
        </div>
      )}
      {data.categoryId === 6 && data.coolingShelter?.localGovernmentName && (
        <div className="detail-section">
          <img src="/public/images/handshake.svg" alt="" />
          <div>
            <FormattedMessage
              id="coolingShelter.localGovernment"
              values={{ name: data.coolingShelter.localGovernmentName }}
            />
          </div>
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
