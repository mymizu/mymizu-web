import React, {useEffect, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import axios from "axios";

const Metrics = () => {
  const intl = useIntl()

  const PLACEHOLDER = "..."
  const COMMUNITY_DATA_KEY = "refillAmount"
  const COMMUNITY_DATA_EXPIRES_AT = "refillAmountExpiresAt"

  const [stats, setStats] = useState(null);
  const [bottles, setBottles] = useState(null);
  const [co2, setCo2] = useState(null);
  const [money, setMoney] = useState(null);

  useEffect(() => {
    if(localStorage.getItem(COMMUNITY_DATA_EXPIRES_AT) && localStorage.getItem(COMMUNITY_DATA_KEY)) {
      const expiresAt = new Date(localStorage.getItem(COMMUNITY_DATA_EXPIRES_AT));
      if(expiresAt > new Date()) {
        setStats(localStorage.getItem(COMMUNITY_DATA_KEY))
        return
      }
    }
    
    const fetchCommunityStats = async () => {
      try {
        const res = await axios.get("/community");
        res.status === 200 && setStats(res.data.refill_amount);
        localStorage.setItem(COMMUNITY_DATA_KEY, res.data.refill_amount);
        localStorage.setItem(COMMUNITY_DATA_EXPIRES_AT, new Date(Date.now() + ( 3600 * 1000 * 24)).toString())
      } catch (e) {
        console.error(e);
      }
    };
    fetchCommunityStats();
  }, []);

  const numberFormatter = new Intl.NumberFormat("ja-JP");
  useEffect(() => {
    if (stats) {
      const refill = stats; // ml
      const bottlesNo = refill / 500;
      setBottles(Math.floor(bottlesNo).toString());
      setCo2(Math.floor((bottlesNo * 0.3333) / 1000).toFixed(1).toString());
      setMoney(Math.floor((bottlesNo * 110) / 1000).toString());
    }
  }, [stats]);

  return stats && (
    <div className="metrics">
      <Metric
        background="ocean"
        label={"metrics.bottle"}
        value={stats ? numberFormatter.format(bottles) : PLACEHOLDER}
      />
      <Metric
        background="forest"
        label={"metrics.co2"}
        value={stats ? numberFormatter.format(co2) : PLACEHOLDER}
      />
      <Metric
        background="money"
        label={"metrics.money"}
        value={stats ? ("¥" + numberFormatter.format(money) + intl.formatMessage({id: 'metrics.money_suffix'})) : PLACEHOLDER}
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
