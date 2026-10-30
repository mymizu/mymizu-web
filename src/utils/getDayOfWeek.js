// Today's name in the page's language: the keys of a spot's opening_hours.
// Takes the locale rather than reading it from localStorage, so the spot card
// can render on the server too.
const getDayOfWeek = (locale) => {
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
  return (DAYS[locale] || DAYS.en)[dayIndex];
};

export default getDayOfWeek;
