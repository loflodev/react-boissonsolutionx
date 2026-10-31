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

// `pages`: paths of the other prerendered pages (e.g. the privacy policy)
export const buildSitemap = (siteUrl, products, lastmod, pages = []) => {
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
  </url>${pages
    .map(
      (path) => `
  <url>
    <loc>${siteUrl}${escapeXml(path)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
    )
    .join("")}
</urlset>
`;
};

// `legalLinks`: [{ name, path }] appended to the links
export const buildLlmsTxt = (siteUrl, hero, products, legalLinks = []) => `# ${SITE_NAME}

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
${legalLinks.map((link) => `- [${link.name}](${siteUrl}${link.path})\n`).join("")}`;

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

// pageData/pageDataId: the WordPress content embedded for hydration
export const buildHeadExtra = ({ fonts = [], wpOrigin, jsonLd, pageData, pageDataId }) =>
  [
    ...(wpOrigin ? [`<link rel="preconnect" href="${escapeAttr(wpOrigin)}" />`] : []),
    ...fonts.map(
      (file) =>
        `<link rel="preload" as="font" type="font/woff2" href="/assets/${escapeAttr(file)}" crossorigin />`
    ),
    `<script type="application/ld+json">${toScriptJson(jsonLd)}</script>`,
    ...(pageData
      ? [`<script id="${pageDataId}" type="application/json">${toScriptJson(pageData)}</script>`]
      : []),
  ].join("\n    ");

// Swap the home page's <head> metadata in the built index.html for another
// page's, and drop the hero image preload only the home page needs. Runs
// before fillTemplate, so `url` may use the __SITE_URL__ placeholder
export const setPageMeta = (html, { title, description, url }) => {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const u = escapeAttr(url);
  return html
    .replace(/<title>[^<]*<\/title>/, () => `<title>${t}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, (_, a, b) => `${a}${d}${b}`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${u}${b}`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, (_, a, b) => `${a}${u}${b}`)
    .replace(/(<meta (?:property|name)="(?:og|twitter):title" content=")[^"]*(")/g, (_, a, b) => `${a}${t}${b}`)
    .replace(
      /(<meta\s+(?:property|name)="(?:og|twitter):description"\s+content=")[^"]*(")/g,
      (_, a, b) => `${a}${d}${b}`
    )
    .replace(/\s*<link rel="preload" as="image" href="\/bottles\.webp"[^>]*>/, "");
};
