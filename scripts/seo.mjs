// Pure builders for the build-time prerender (scripts/prerender.mjs):
// JSON-LD, sitemap.xml, llms.txt and the extra <head> tags. No I/O here,
// so everything is unit-tested in scripts/seo.test.mjs.

export const SITE_NAME = "Boisson SolutionX";
const SITE_DESCRIPTION =
  "Jus de fruits naturels mélangés au petit cola (noix de kola, cola acuminata), conservés par haute pression (HPP) pour préserver saveur et valeurs nutritives.";

// Fonts visible above the fold (latin subsets only): body Inter, display Playfair
const PRELOADED_FONTS = [
  /^inter-latin-opsz-normal-[\w-]+\.woff2$/,
  /^playfair-display-latin-wght-normal-[\w-]+\.woff2$/,
];

// JSON inside <script> must not be able to close the tag
export const toScriptJson = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

export const escapeXml = (text) =>
  text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

const escapeAttr = (text) =>
  text.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const buildJsonLd = (siteUrl, products) => [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/bsx-logo.webp`,
    description: SITE_DESCRIPTION,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_NAME,
    url: `${siteUrl}/`,
    inLanguage: "fr-CA",
    publisher: { "@id": `${siteUrl}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Nos Produits",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.cover?.node?.sourceUrl,
        brand: { "@type": "Brand", name: SITE_NAME },
      },
    })),
  },
];

export const buildSitemap = (siteUrl, products, lastmod) => {
  const images = products
    .filter((p) => p.cover?.node?.sourceUrl)
    .map(
      (p) => `
    <image:image>
      <image:loc>${escapeXml(p.cover.node.sourceUrl)}</image:loc>
    </image:image>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <image:image>
      <image:loc>${siteUrl}/og-image.jpg</image:loc>
    </image:image>${images}
  </url>
</urlset>
`;
};

export const buildLlmsTxt = (siteUrl, hero, products) => `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${stripHtml(hero?.description)}

Site : ${siteUrl}/
Langue : français (Canada)

## Produits

${products
  .map((p) => {
    const features = [p.features?.feature1, p.features?.feature2]
      .filter(Boolean)
      .join(", ");
    return `- **${p.name}** : ${p.description}${features ? ` (${features})` : ""}`;
  })
  .join("\n")}

## À propos

Chez Boisson SolutionX, tous nos jus de fruits naturels sont mélangés avec du « petit cola », une noix aussi connue sous le nom de cola acuminata ou kola nut, reconnue pour ses bienfaits tonifiants et digestifs. Le HPP (haute pression) est utilisé comme méthode de conservation afin de préserver la composition, la saveur et les valeurs nutritives.

## Services

- Livraison garantie : SolutionX livrée à votre porte
- Localisateur de magasins : trouvez SolutionX chez le détaillant le plus près de chez vous
- Vente en gros : devenez un distributeur de SolutionX

## Liens

- [Accueil](${siteUrl}/)
- [Produits](${siteUrl}/#ourProducts)
- [À propos](${siteUrl}/#about)
- [Nous contacter](${siteUrl}/#contactForm)
`;

// Fill the built index.html (or robots.txt) placeholders. Replacer functions,
// not strings: in a replacement string `$'`, `` $` `` and `$&` are patterns,
// and WordPress text must come out exactly as written
export const fillTemplate = (template, { appHtml = "", headExtra = "", siteUrl }) =>
  template
    .replace("<!--app-html-->", () => appHtml)
    .replace("<!--head-extra-->", () => headExtra)
    .replace(/__SITE_URL__/g, () => siteUrl);

// Hashed font files from dist/assets that the first paint needs
export const pickPreloadFonts = (assetNames) =>
  PRELOADED_FONTS.map((pattern) => assetNames.find((name) => pattern.test(name))).filter(
    Boolean
  );

// Origin of the WordPress host (product images, GraphQL refresh), or null
export const toOrigin = (url) => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

export const buildHeadExtra = ({ fonts = [], wpOrigin, jsonLd, homeData, homeDataId }) =>
  [
    ...(wpOrigin ? [`<link rel="preconnect" href="${escapeAttr(wpOrigin)}" />`] : []),
    ...fonts.map(
      (file) =>
        `<link rel="preload" as="font" type="font/woff2" href="/assets/${escapeAttr(file)}" crossorigin />`
    ),
    `<script type="application/ld+json">${toScriptJson(jsonLd)}</script>`,
    `<script id="${homeDataId}" type="application/json">${toScriptJson(homeData)}</script>`,
  ].join("\n    ");
