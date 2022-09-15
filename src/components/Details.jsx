import React from "react";
import ReactGA from "react-ga";
import {FormattedMessage, useIntl} from "react-intl";

export const Details = ({ data }) => {
  const intl = useIntl()
  const sendGaOutboundLink = (e) => {
    const link = e.target.href;
    ReactGA.outboundLink(
      {
        label: link,
      },
      () => {}
    );
  }
  return (
    <div>
      <div className="border-blue"></div>
      {data.refillMethod && (
      <div className="detail-section">
        <img src="/public/images/cup.svg" alt="" />
        <div>{data.refillMethod}</div>
      </div>
      )}
      {data.openingHours && (
        <div className="detail-section">
          <img src="/public/images/clock.svg" alt="" />
          <div>
            {Object.keys(data.openingHours).map((key, keyIdx) => (
              <div className="place-open-section" key={keyIdx}>
                <p className="place-open-day">{key}</p>
                <p>{data.openingHours[key][0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.link && (
        <div className="detail-section">
          <img src="/public/images/globe.svg" alt="" />
          <div><a href={data.link} onClick={sendGaOutboundLink} target="_new" rel="noopener nofollow" target="_blank">{data.link}</a></div>
        </div>
      )}
      {data.address && (
        <div className="detail-section">
          <img src="/public/images/pin_drop.svg" alt="" />
          <div>{data.address}</div>
        </div>
      )}
      <div className="detail-section">
        <img src="/public/images/info.svg" alt="" />
        <div><a href={intl.locale === "en" ? `https://docs.google.com/forms/d/e/1FAIpQLSeRNzWZhQ7jBGzZQOJS4sHt1s4MUR6cf2AinT5ujioLJChPYQ/viewform?usp=pp_url&entry.2092238618=${data.id}` : `https://docs.google.com/forms/d/e/1FAIpQLSe0sjbGYk-jJAOxhTFd6eWGWxLbsidYWK4VMPyVmDPx7UGlFQ/viewform?usp=pp_url&entry.2092238618=${data.id}`} target="_new"><FormattedMessage id="spot.report" /></a></div>
      </div>
    </div>
  );
};
