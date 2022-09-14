import React, {useEffect, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";

const Metrics = () => {
  const [stats, setStats] = useState(null);
  const intl = useIntl()
  useEffect(() => {
    const fetchCommunityStats = async () => {
      try {
        const res = await fetch("/community");
        const json = await res.json();
        res.status === 200 && setStats(json);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCommunityStats();
  }, []);

  const numberFormatter = new Intl.NumberFormat("ja-JP");
  let bottle = 0,
    co2 = 0,
    money = 0;

  if (stats) {
    const refill = stats.refill_amount; // ml
    bottle = Math.floor(refill / 500);
    co2 = Math.floor(bottle * 0.3333);
    money = Math.floor((bottle * 110) / 1000);
  }

  return (
    <div className="metrics">
      <Metric
        background="ocean"
        label={"metrics.bottle"}
        value={numberFormatter.format(bottle)}
      />
      <Metric
        background="forest"
        label={"metrics.co2"}
        value={numberFormatter.format(co2)}
      />
      <Metric
        background="money"
        label={"metrics.money"}
        value={"¥" + numberFormatter.format(money) + intl.formatMessage({id: 'metrics.money_suffix'})}
      />
    </div>
  );
};
export default Metrics;

const Metric = ({background, label, value}) => {
  // TODO: use an optimized webp image and fallback to jpg
  const backgroundUrl = `url(../images/metrics/${background}.jpg)`;

  return (
    <div className="metric" style={{"--background": backgroundUrl}}>
      <div className="metric__overlay"/>
      <div className="metric__top-label">
        <FormattedMessage id="metrics.community"/>
      </div>
      <div className="metric__value">{value}</div>
      <div className="metric__bottom-label">
        {" "}
        <FormattedMessage id={label} defaultMessage={""}/>
      </div>
    </div>
  );
};
