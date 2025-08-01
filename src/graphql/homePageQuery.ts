export const HOME_PAGE_QUERY = `
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
            link
            sourceUrl
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
            link
            sourceUrl
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
            link
            sourceUrl
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
            link
            sourceUrl
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
