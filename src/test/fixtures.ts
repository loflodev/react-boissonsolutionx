import type { Page, PrivacyPage, ProductCard } from "../type";

export const makeProduct = (name: string, slug: string): ProductCard => ({
  cover: {
    node: {
      link: `https://api.example.test/${slug}`,
      sourceUrl: `https://api.example.test/uploads/${slug}.webp`,
      srcSet: `https://api.example.test/uploads/${slug}-300x300.webp 300w, https://api.example.test/uploads/${slug}.webp 1024w`,
      mediaDetails: { width: 1024, height: 1024 },
    },
  },
  name,
  description: `Eau, petit cola, ${slug}.`,
  features: { feature1: "500 mL", feature2: "Sans sucre ajouté" },
  button: { link: null, label: "Commander" },
});

export const homePage: { page: Page } = {
  page: {
    heroSection: {
      title: "Boisson",
      subtitle: "Solution X",
      description: "<p>Goût unique, authentique et revigorant.</p>",
      image: { node: { link: "", sourceUrl: "/bottles.webp" } },
      button: { link: null, label: "Découvrez nos produits" },
    },
    ourProducts: {
      card1: makeProduct("SolutionX - Betterave", "betterave"),
      card2: makeProduct("SolutionX - Gingembre", "gingembre"),
      card3: makeProduct("SolutionX - Hibiscus", "hibiscus"),
      card4: makeProduct("SolutionX - Watermelon", "watermelon"),
    },
  },
};

// As WPGraphQL returns it: Gutenberg markup, ACF fields with generated names
export const privacyPage: { page: PrivacyPage } = {
  page: {
    title: "Politique de confidentialité",
    content:
      '<h2 class="wp-block-heading">Portée de la politique</h2><p>Ce site.</p>' +
      '<h2 class="wp-block-heading">Témoins (cookies) &amp; suivi</h2>' +
      '<ul class="wp-block-list"><li>Aucun témoin.</li></ul>',
    politiqueDeConfidentialite: {
      intro: "Nous respectons votre vie privée.",
      derniereMiseAJour: "20261030",
      responsableNom: "Jean Wilson",
      responsableTitre: "CEO",
      officeremail: "vie-privee@example.test",
      officeraddress: "1115 Rue King Ouest\r\nSherbrooke, QC",
    },
  },
};
