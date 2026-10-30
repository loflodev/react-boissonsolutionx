// Every card cover needs the same fields, including the WordPress-generated
// srcSet so phones don't download the 1024px original
const CARD_COVER_FRAGMENT = `
  fragment CardCover on MediaItem {
    link
    sourceUrl
    srcSet
    mediaDetails {
      width
      height
    }
  }
`;

export const HOME_PAGE_QUERY = `
  ${CARD_COVER_FRAGMENT}
  query {
    page(id: "home", idType: URI) {
      heroSection {
        description
        subtitle
        title
        image {
          node {
            link
            sourceUrl
          }
        }
        button {
          link {
            target
            title
            url
          }
          label
        }
      }
        ourProducts {
      card1 {
        cover {
          node {
            ...CardCover
          }
        }
        name
        description
          features {
          feature1
          feature2
        }
        button {
          link {
            title
            url
          }
          label
        }       
      }
      card2 {
        cover {
          node {
            ...CardCover
          }
        }
        name
        description
          features {
          feature1
          feature2
        }
        button {
          link {
            title
            url
          }
          label
        }       
      }
      card3 {
        cover {
          node {
            ...CardCover
          }
        }
        name
        description
          features {
          feature1
          feature2
        }
        button {
          link {
            title
            url
          }
          label
        }       
      }
      card4 {
        cover {
          node {
            ...CardCover
          }
        }
        name
        description
          features {
          feature1
          feature2
        }
        button {
          link {
            title
            url
          }
          label
        }       
      }
    }
    }
  }
`;
