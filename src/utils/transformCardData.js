

export const transformCardData = (data) => {
    return {
        carouselImg: data.photos,
        title: data.name,
        description: data.grouped_tags,
        action: {
          route: '',
          share: data.website // button to a link (href)
        },
        // refillMethod: ,// inside the comment - need to split the string?
        openingHours: data.opening_hours,
        link: data.website,
        
        feedback: '', // opens a card (someone else)
        slug: data.slug
      }
}