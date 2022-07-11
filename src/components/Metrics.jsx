import React, { useEffect, useState } from "react";

const lang = "ja"; // TODO: remove when i18n is supported

const labels = {
  metricsCommunity: {
    ja: "mymizuコミュニティとして約",
    en: "together, we’ve saved",
  },
  metricsBottle: {
    ja: "本のペットボトルを消滅しました！",
    en: "plastic bottles!",
  },
  metricsCO2: {
    ja: "トンのCO²を消滅しました！",
    en: "kg of CO²!",
  },
  metricsMoney: {
    ja: "を節約しました！",
    en: "",
  },
};

const Metrics = () => {
  const [stats, setStats] = useState(null);

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
    money = Math.floor(bottle * 110);
  }

  return (
    <div className="metrics">
      <Metric
        background="ocean"
        label={labels.metricsBottle[lang]}
        value={numberFormatter.format(bottle)}
      />
      <Metric
        background="forest"
        label={labels.metricsCO2[lang]}
        value={numberFormatter.format(co2)}
      />
      <Metric
        background="money"
        label={labels.metricsMoney[lang]}
        value={"¥" + numberFormatter.format(money)}
      />
    </div>
  );
};
export default Metrics;

const Metric = ({ background, label, value }) => {
  // TODO: use an optimized webp image and fallback to jpg
  const backgroundUrl = `url(../images/metrics/${background}.jpg)`;

  return (
    <div className="metric" style={{ "--background": backgroundUrl }}>
      <div className="metric__overlay" />
      <div className="metric__top-label">{labels.metricsCommunity[lang]}</div>
      <div className="metric__value">{value}</div>
      <div className="metric__bottom-label">{label}</div>
    </div>
  );
};
