// Tap::COOLING_SHELTER_CATEGORY_ID (backend) = 6
const COOLING_SHELTER_CATEGORY_ID = 6;

export const transformCardData = (data, locale) => {
  const isCoolingShelter = data.category_id === COOLING_SHELTER_CATEGORY_ID;

  return {
    id: data.id,
    carouselImg: data.photos,
    title: data.name,
    description: data.grouped_tags,
    action: {
      route: "",
      share: `https://map.mymizu.co/refill/${locale}/${data.slug}`, // button to a link (href)
    },
    refillMethod: data.refill_instruction,
    openingHours: data.opening_hours,
    // Cooling shelters never have a website in the import data; guard is
    // already implicit since data.website is null for them, kept explicit here for clarity.
    link: isCoolingShelter ? null : data.website,
    address: data.address,
    comment: data.comment,
    waterType: data.grouped_tags.Water,
    isSearch: data.isSearch,
    feedback: "", // opens a card (someone else)
    slug: data.slug,
    categoryId: data.category_id,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: data.created_at,
    location: data.location,
    // Only present (non-null) for cooling shelters, per API contract (PR #129).
    // Every field inside is individually nullable, guarded in Details.jsx.
    coolingShelter: isCoolingShelter && data.cooling_shelter
      ? {
          phone: data.cooling_shelter.phone ?? null,
          capacity: data.cooling_shelter.capacity ?? null,
          localGovernmentName: data.cooling_shelter.local_government_name ?? null,
          // Server-formatted, localized, multi-line string. Do NOT re-parse — just split on "\n" for display.
          formattedOpeningHours: data.cooling_shelter.formatted_opening_hours ?? null,
        }
      : null,
  };
};
