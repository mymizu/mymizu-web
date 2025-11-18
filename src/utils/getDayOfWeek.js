import { LANG_PREF_KEY } from "../constants";

export default getDayOfWeek = () => {
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

  const locale = localStorage.getItem(LANG_PREF_KEY);
  const dayIndex = new Date().getDay();
  return DAYS[locale][dayIndex];
};
