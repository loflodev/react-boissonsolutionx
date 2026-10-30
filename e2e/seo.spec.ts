import { expect, test } from "./fixtures";

// Crawlers and link previewers see the same HTML on any viewport: check once
test.skip(({ isMobile }) => isMobile, "viewport-independent");

test.describe("without JavaScript (crawlers, AI bots, link previews)", () => {
  test.use({ javaScriptEnabled: false });

  test("serves the full content in the HTML", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/\S/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "Nos Produits" })).toBeVisible();
    expect(await page.locator("#ourProducts article").count()).toBeGreaterThan(0);
    await expect(page.getByRole("heading", { name: "Nous Contacter" })).toBeVisible();
  });
});

test.describe("head metadata", () => {
  test("has a French title, description, canonical and robots", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr-CA");
    await expect(page).toHaveTitle(/Boisson SolutionX/);

    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length).toBeGreaterThan(50);
    expect(description?.length).toBeLessThanOrEqual(160);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https:\/\/[^/]+\/$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index, follow/);
    // No build placeholder may leak into the page
    expect(await page.content()).not.toContain("__SITE_URL__");
  });

  test("has complete Open Graph and Twitter cards", async ({ page }) => {
    await page.goto("/");
    const meta = (key: string) =>
      page.locator(`meta[property="${key}"], meta[name="${key}"]`).getAttribute("content");

    for (const key of [
      "og:type",
      "og:locale",
      "og:site_name",
      "og:title",
      "og:description",
      "og:url",
      "og:image",
      "og:image:alt",
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
      "twitter:image:alt",
    ]) {
      expect(await meta(key), key).toBeTruthy();
    }
    expect(await meta("og:image")).toMatch(/^https:\/\/.+\/og-image\.jpg$/);
    expect(await meta("og:url")).toBe(await page.locator('link[rel="canonical"]').getAttribute("href"));
    expect(await meta("twitter:card")).toBe("summary_large_image");
  });

  test("ships a 1200x630 social image and a PNG touch icon", async ({ page, request }) => {
    const og = await request.get("/og-image.jpg");
    expect(og.headers()["content-type"]).toContain("image/jpeg");

    await page.goto("/");
    const size = await page.evaluate(async () => {
      const img = new Image();
      img.src = "/og-image.jpg";
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    });
    expect(size).toEqual([1200, 630]);

    const icon = await request.get("/apple-touch-icon.png");
    expect(icon.ok()).toBe(true);
    expect(icon.headers()["content-type"]).toContain("image/png");
  });

  test("describes the organization, site and products in JSON-LD", async ({ page }) => {
    await page.goto("/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const graph = blocks.flatMap((text) => JSON.parse(text));
    const types = graph.map((node: { "@type": string }) => node["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "ItemList"]));

    const list = graph.find((node: { "@type": string }) => node["@type"] === "ItemList");
    expect(list.itemListElement.length).toBeGreaterThan(0);
    for (const entry of list.itemListElement) {
      expect(entry.item["@type"]).toBe("Product");
      expect(entry.item.name).toBeTruthy();
      expect(entry.item.image).toMatch(/^https:\/\//);
    }
  });

  test("preloads the hero image and fonts, and preconnects to WordPress", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="preload"][as="image"][href="/bottles.webp"]')).toHaveCount(1);
    await expect(page.locator('link[rel="preload"][as="font"][crossorigin]')).toHaveCount(2);
    await expect(page.locator('link[rel="preconnect"]')).toHaveCount(1);
  });
});

test.describe("crawler files", () => {
  test("robots.txt allows crawling and points to the sitemap", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/User-agent: \*\s+Allow: \//);
    expect(robots).toMatch(/^Sitemap: https:\/\/.+\/sitemap\.xml$/m);
    expect(robots).not.toContain("__SITE_URL__");
  });

  test("sitemap.xml lists the homepage and its images", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBe(true);
    const xml = await res.text();
    expect(xml).toMatch(/<loc>https:\/\/[^<]+\/<\/loc>/);
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    expect(xml).toContain("og-image.jpg</image:loc>");
  });

  test("llms.txt summarizes the brand and products", async ({ request }) => {
    const txt = await (await request.get("/llms.txt")).text();
    expect(txt).toMatch(/^# Boisson SolutionX/);
    expect(txt).toContain("## Produits");
    expect(txt).toMatch(/^- \*\*.+\*\* : /m);
  });
});
