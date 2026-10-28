// Tap::COOLING_SHELTER_CATEGORY_ID (backend) = 6
const COOLING_SHELTER_CATEGORY_ID = 6;

// The <title> of a refill spot page. Shared by the server, which puts it in the
// HTML for crawlers, and the browser, which sets it again when a spot is opened
// on the map. Both must agree, or Google sees one title in the HTML and another
// once it has rendered the page.
export const spotTitle = (spot, language) => {
  const name = spot?.name || "";
  const ja = /^ja\b/.test(language || "");
  const shelter = spot?.category_id === COOLING_SHELTER_CATEGORY_ID;

  if (ja) {
    return `${name} — ${shelter ? "クーリングシェルター" : "無料給水スポット"} | mymizu`;
  }
  return `${name} — ${shelter ? "cooling shelter" : "free water refill spot"} | mymizu`;
};
