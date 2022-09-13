export const transformCardData = (data) => {
  return {
    id: data.id,
    carouselImg: data.photos,
    title: data.name,
    description: data.grouped_tags,
    action: {
      route: "",
      share: `https://map.mymizu.co/refill/en/${data.slug}`, // button to a link (href)
    },
    refillMethod: data.refill_instruction,
    openingHours: data.opening_hours,
    link: data.website,
    address: data.address,
    comment: data.comment,
    waterType: data.grouped_tags.Water,
    isSearch: data.isSearch,
    feedback: "", // opens a card (someone else)
    slug: data.slug,
    categoryId: data.category_id,
    latitude: data.latitude,
    longitude: data.longitude
  };
};
