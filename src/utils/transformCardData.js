export const transformCardData = (data) => {
  return {
    carouselImg: data.photos,
    title: data.name,
    description: data.grouped_tags,
    action: {
      route: "",
      share: data.website, // button to a link (href)
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
  };
};
