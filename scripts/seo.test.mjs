import { describe, expect, it } from "vitest";
import {
  SITE_NAME,
  buildHeadExtra,
  buildJsonLd,
  buildLlmsTxt,
  buildSitemap,
  escapeXml,
  fillTemplate,
  pickPreloadFonts,
  setPageMeta,
  stripHtml,
  toOrigin,
  toScriptJson,
} from "./seo.mjs";

const SITE = "https://boissonsolutionx.ca";

const product = (name, slug, features = { feature1: "500 mL", feature2: "HPP" }) => ({
  name,
  description: `Eau, petit cola, ${slug}.`,
  cover: { node: { sourceUrl: `https://api.boissonsolutionx.ca/uploads/${slug}.webp?v=1&s=2` } },
  features,
});

const products = [product("SolutionX - Betterave", "betterave"), product("SolutionX - Gingembre", "gingembre")];

describe("toScriptJson", () => {
  it("cannot close the surrounding <script> tag", () => {
    const json = toScriptJson({ html: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json).html).toBe("</script><script>alert(1)</script>");
  });
});

describe("text helpers", () => {
  it("escapes XML special characters", () => {
    expect(escapeXml(`a&b<c>"d'`)).toBe("a&#38;b&#60;c&#62;&#34;d&#39;");
  });

  it("flattens HTML to plain text", () => {
    expect(stripHtml("<p>Goût <strong>unique</strong></p>\n<p>et revigorant</p>")).toBe(
      "Goût unique et revigorant"
    );
    expect(stripHtml(undefined)).toBe("");
  });
});

describe("buildJsonLd", () => {
  const [organization, website, list] = buildJsonLd(SITE, products);

  it("describes the organization and the French-Canadian website", () => {
    expect(organization).toMatchObject({
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: SITE_NAME,
      url: `${SITE}/`,
      logo: `${SITE}/bsx-logo.webp`,
    });
    expect(website).toMatchObject({
      "@type": "WebSite",
      inLanguage: "fr-CA",
      publisher: { "@id": `${SITE}/#organization` },
    });
  });

  it("lists every product in order with its image and brand", () => {
    expect(list["@type"]).toBe("ItemList");
    expect(list.itemListElement).toHaveLength(2);
    expect(list.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Product",
        name: "SolutionX - Gingembre",
        description: "Eau, petit cola, gingembre.",
        image: "https://api.boissonsolutionx.ca/uploads/gingembre.webp?v=1&s=2",
        brand: { "@type": "Brand", name: SITE_NAME },
      },
    });
  });
});

describe("buildSitemap", () => {
  const xml = buildSitemap(SITE, products, "2026-10-29");

  it("lists the homepage with its last modification date", () => {
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain(`<loc>${SITE}/</loc>`);
    expect(xml).toContain("<lastmod>2026-10-29</lastmod>");
  });

  it("includes the social image and escaped product images", () => {
    expect(xml).toContain(`<image:loc>${SITE}/og-image.jpg</image:loc>`);
    expect(xml).toContain("betterave.webp?v=1&#38;s=2");
    expect(xml).not.toMatch(/&(?!#\d+;)/);
  });

  it("lists the other pages without images", () => {
    const withPages = buildSitemap(SITE, [], "2026-10-29", ["/politique-de-confidentialite"]);
    expect(withPages).toContain(
      `<url>\n    <loc>${SITE}/politique-de-confidentialite</loc>\n    <lastmod>2026-10-29</lastmod>\n  </url>`
    );
    expect(xml.match(/<url>/g)).toHaveLength(1);
  });

  it("skips products without an image", () => {
    const noImage = { ...product("Sans image", "x"), cover: null };
    expect(buildSitemap(SITE, [noImage], "2026-10-29").match(/<image:image>/g)).toHaveLength(1);
  });
});

describe("buildLlmsTxt", () => {
  const txt = buildLlmsTxt(SITE, { description: "<p>Goût unique</p>" }, [
    ...products,
    product("SolutionX - Hibiscus", "hibiscus", { feature1: "", feature2: "" }),
  ]);

  it("starts with the site name and summary", () => {
    expect(txt.startsWith(`# ${SITE_NAME}\n\n> `)).toBe(true);
    expect(txt).toContain("Goût unique");
    expect(txt).toContain(`Site : ${SITE}/`);
  });

  it("lists products with their features, omitting empty ones", () => {
    expect(txt).toContain("- **SolutionX - Betterave** : Eau, petit cola, betterave. (500 mL, HPP)");
    expect(txt).toContain("- **SolutionX - Hibiscus** : Eau, petit cola, hibiscus.\n");
  });

  it("links to every section", () => {
    for (const anchor of ["#ourProducts", "#about", "#contactForm"]) {
      expect(txt).toContain(`${SITE}/${anchor}`);
    }
  });

  it("appends the legal links", () => {
    const withLegal = buildLlmsTxt(SITE, {}, [], [{ name: "Confidentialité", path: "/conf" }]);
    expect(withLegal.endsWith(`- [Confidentialité](${SITE}/conf)\n`)).toBe(true);
  });
});

describe("pickPreloadFonts", () => {
  it("picks only the latin Inter and Playfair files", () => {
    const assets = [
      "index-abc.js",
      "inter-cyrillic-ext-opsz-normal-CfYZpDVp.woff2",
      "inter-latin-ext-opsz-normal-DpK-iCPk.woff2",
      "inter-latin-opsz-normal-BwkfbSeq.woff2",
      "playfair-display-latin-wght-normal-BOwq7MWX.woff2",
      "playfair-display-latin-ext-wght-normal-X.woff2",
    ];
    expect(pickPreloadFonts(assets)).toEqual([
      "inter-latin-opsz-normal-BwkfbSeq.woff2",
      "playfair-display-latin-wght-normal-BOwq7MWX.woff2",
    ]);
  });

  it("returns nothing when the fonts are missing", () => {
    expect(pickPreloadFonts(["index.js"])).toEqual([]);
  });
});

describe("toOrigin", () => {
  it("keeps only the origin", () => {
    expect(toOrigin("https://api.boissonsolutionx.ca/wp-content/uploads/a.webp")).toBe(
      "https://api.boissonsolutionx.ca"
    );
  });

  it("returns null for missing or relative URLs", () => {
    expect(toOrigin(undefined)).toBeNull();
    expect(toOrigin("/graphql")).toBeNull();
  });
});

describe("buildHeadExtra", () => {
  const head = buildHeadExtra({
    fonts: ["inter-latin-opsz-normal-X.woff2"],
    wpOrigin: "https://api.boissonsolutionx.ca",
    jsonLd: [{ "@type": "Organization" }],
    pageData: { page: { title: "</script>" } },
    pageDataId: "__HOME_DATA__",
  });

  it("preconnects to WordPress and preloads the fonts (CORS, as fonts require)", () => {
    expect(head).toContain('<link rel="preconnect" href="https://api.boissonsolutionx.ca" />');
    expect(head).toContain(
      '<link rel="preload" as="font" type="font/woff2" href="/assets/inter-latin-opsz-normal-X.woff2" crossorigin />'
    );
  });

  it("embeds JSON-LD and the home data safely", () => {
    expect(head).toContain('<script type="application/ld+json">[{"@type":"Organization"}]</script>');
    expect(head).toContain('<script id="__HOME_DATA__" type="application/json">');
    expect(head.match(/<\/script>/g)).toHaveLength(2);
  });

  it("omits the embedded data when a page has none", () => {
    const page = buildHeadExtra({ jsonLd: [] });
    expect(page).not.toContain('type="application/json"');
    expect(page.match(/<\/script>/g)).toHaveLength(1);
  });

  it("omits the preconnect when the origin is unknown", () => {
    const minimal = buildHeadExtra({ jsonLd: [], pageData: {}, pageDataId: "x", wpOrigin: null });
    expect(minimal).not.toContain("preconnect");
  });
});

describe("fillTemplate", () => {
  const template =
    '<head><!--head-extra--></head><div id="root"><!--app-html--></div><script type="module" src="/x.js"></script> __SITE_URL__/';

  it("fills every placeholder", () => {
    expect(fillTemplate(template, { appHtml: "<main></main>", headExtra: "<meta>", siteUrl: SITE })).toBe(
      `<head><meta></head><div id="root"><main></main></div><script type="module" src="/x.js"></script> ${SITE}/`
    );
  });

  it("keeps $ patterns in WordPress text literal", () => {
    const appHtml = "<h3>Prix $' et $` et $&</h3>";
    const html = fillTemplate(template, { appHtml, headExtra: toScriptJson({ name: "$'" }), siteUrl: SITE });
    expect(html).toContain(appHtml);
    expect(html).toContain('{"name":"$\'"}');
    expect(html.match(/<script type="module"/g)).toHaveLength(1);
  });
});

describe("setPageMeta", () => {
  const template = `<head>
    <title>Accueil</title>
    <meta
      name="description"
      content="Home description"
    />
    <link rel="canonical" href="__SITE_URL__/" />
    <link rel="preload" as="image" href="/bottles.webp" fetchpriority="high" />
    <meta property="og:title" content="Accueil" />
    <meta
      property="og:description"
      content="Home description"
    />
    <meta property="og:url" content="__SITE_URL__/" />
    <meta property="og:image" content="__SITE_URL__/og-image.jpg" />
    <meta name="twitter:title" content="Accueil" />
    <meta
      name="twitter:description"
      content="Home description"
    />
  </head>`;
  const html = setPageMeta(template, {
    title: "Politique – Boisson SolutionX",
    description: "Vos droits & nos pratiques",
    url: "__SITE_URL__/politique",
  });

  it("replaces the title, description and URL in every tag", () => {
    expect(html).toContain("<title>Politique – Boisson SolutionX</title>");
    expect(html.match(/content="Politique – Boisson SolutionX"/g)).toHaveLength(2);
    expect(html.match(/content="Vos droits &#38; nos pratiques"/g)).toHaveLength(3);
    expect(html).toContain('<link rel="canonical" href="__SITE_URL__/politique" />');
    expect(html).toContain('<meta property="og:url" content="__SITE_URL__/politique" />');
    expect(html).not.toMatch(/Accueil|Home description/);
  });

  it("drops the hero image preload but keeps the social image", () => {
    expect(html).not.toContain("bottles.webp");
    expect(html).toContain("og-image.jpg");
  });
});
