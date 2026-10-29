// Build-time prerender: bakes the WordPress content into dist/index.html so
// search engines, AI crawlers and social previewers get real HTML without
// running JavaScript. Also writes sitemap.xml and llms.txt.
//
// Runs after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = `${ROOT}dist`;
const SSR_ENTRY = `${ROOT}dist-ssr/entry-server.js`;
const SITE_URL_TOKEN = /__SITE_URL__/g;
const FALLBACK_SITE_URL = "https://boissonsolutionx.ca";
const SITE_NAME = "Boisson SolutionX";
const SITE_DESCRIPTION =
  "Jus de fruits naturels mélangés au petit cola (noix de kola, cola acuminata), conservés par haute pression (HPP) pour préserver saveur et valeurs nutritives.";

const env = { ...loadEnv("production", ROOT, "VITE_"), ...process.env };
const siteUrl = (env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, "");
if (!env.VITE_SITE_URL) {
  console.warn(`[prerender] VITE_SITE_URL not set, using ${FALLBACK_SITE_URL}`);
}

// JSON inside <script> must not be able to close the tag
const toScriptJson = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

const escapeXml = (text) =>
  text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const buildJsonLd = (products) => [
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

const buildSitemap = (products) => {
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
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <image:image>
      <image:loc>${siteUrl}/og-image.jpg</image:loc>
    </image:image>${images}
  </url>
</urlset>
`;
};

const buildLlmsTxt = (hero, products) => `# ${SITE_NAME}

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

const main = async () => {
  const { render, loadHomeContent, convertToArray, HOME_DATA_SCRIPT_ID } =
    await import(SSR_ENTRY);

  // Fail the build rather than ship an empty page
  const content = await loadHomeContent();
  const products = convertToArray(content.page.ourProducts);
  const hero = content.page.heroSection;

  const headExtra = [
    `<script type="application/ld+json">${toScriptJson(buildJsonLd(products))}</script>`,
    `<script id="${HOME_DATA_SCRIPT_ID}" type="application/json">${toScriptJson(content)}</script>`,
  ].join("\n    ");

  const template = await readFile(`${DIST}/index.html`, "utf8");
  const html = template
    .replace("<!--app-html-->", render(content))
    .replace("<!--head-extra-->", headExtra)
    .replace(SITE_URL_TOKEN, siteUrl);
  await writeFile(`${DIST}/index.html`, html);

  const robots = await readFile(`${DIST}/robots.txt`, "utf8");
  await writeFile(`${DIST}/robots.txt`, robots.replace(SITE_URL_TOKEN, siteUrl));

  await writeFile(`${DIST}/sitemap.xml`, buildSitemap(products));
  await writeFile(`${DIST}/llms.txt`, buildLlmsTxt(hero, products));

  await rm(`${ROOT}dist-ssr`, { recursive: true, force: true });
  console.log(
    `[prerender] ${products.length} products → index.html, sitemap.xml, llms.txt (${siteUrl})`
  );
};

main().catch((error) => {
  console.error("[prerender] failed:", error);
  process.exit(1);
});
