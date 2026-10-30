// Build-time prerender: bakes the WordPress content into dist/index.html so
// search engines, AI crawlers and social previewers get real HTML without
// running JavaScript. Also writes sitemap.xml and llms.txt.
//
// Runs after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { loadEnv } from "vite";
import {
  buildHeadExtra,
  buildJsonLd,
  buildLlmsTxt,
  buildSitemap,
  fillTemplate,
  pickPreloadFonts,
  toOrigin,
} from "./seo.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = `${ROOT}dist`;
const SSR_ENTRY = `${ROOT}dist-ssr/entry-server.js`;
const FALLBACK_SITE_URL = "https://boissonsolutionx.ca";

const env = { ...loadEnv("production", ROOT, "VITE_"), ...process.env };
const siteUrl = (env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, "");
if (!env.VITE_SITE_URL) {
  console.warn(`[prerender] VITE_SITE_URL not set, using ${FALLBACK_SITE_URL}`);
}

const main = async () => {
  const {
    render,
    loadHomeContent,
    convertToArray,
    sanitizeHomeContent,
    HOME_DATA_SCRIPT_ID,
  } = await import(SSR_ENTRY);

  // Fail the build rather than ship an empty page. The WordPress HTML is
  // sanitized here, before it reaches the static HTML or its embedded data:
  // in the browser the hydration keeps whatever markup the server sent
  const purifier = createDOMPurify(new JSDOM("").window);
  const content = sanitizeHomeContent(await loadHomeContent(), purifier);
  const products = convertToArray(content.page.ourProducts);
  const hero = content.page.heroSection;

  const headExtra = buildHeadExtra({
    fonts: pickPreloadFonts(await readdir(`${DIST}/assets`)),
    // Product images are served from the WordPress host
    wpOrigin:
      toOrigin(products[0]?.cover?.node?.sourceUrl) ?? toOrigin(env.VITE_WP_DOMAIN),
    jsonLd: buildJsonLd(siteUrl, products),
    homeData: content,
    homeDataId: HOME_DATA_SCRIPT_ID,
  });

  const template = await readFile(`${DIST}/index.html`, "utf8");
  const html = fillTemplate(template, { appHtml: render(content), headExtra, siteUrl });
  await writeFile(`${DIST}/index.html`, html);

  const robots = await readFile(`${DIST}/robots.txt`, "utf8");
  await writeFile(`${DIST}/robots.txt`, fillTemplate(robots, { siteUrl }));

  const today = new Date().toISOString().slice(0, 10);
  await writeFile(`${DIST}/sitemap.xml`, buildSitemap(siteUrl, products, today));
  await writeFile(`${DIST}/llms.txt`, buildLlmsTxt(siteUrl, hero, products));

  await rm(`${ROOT}dist-ssr`, { recursive: true, force: true });
  console.log(
    `[prerender] ${products.length} products → index.html, sitemap.xml, llms.txt (${siteUrl})`
  );
};

main().catch((error) => {
  console.error("[prerender] failed:", error);
  process.exit(1);
});
