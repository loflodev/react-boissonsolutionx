// @vitest-environment node
// The build-time prerender runs in Node, without a DOM
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { render, sanitizeHomeContent } from "./entry-server";
import { homePage } from "./test/fixtures";

describe("prerender sanitizing", () => {
  // What scripts/prerender.mjs does before baking the page
  const purifier = createDOMPurify(new JSDOM("").window);
  const dirty = {
    page: {
      ...homePage.page,
      heroSection: {
        ...homePage.page.heroSection,
        description:
          '<p>Bonjour <a href="javascript:alert(3)">x</a></p><img src="x" onerror="alert(1)"><script>alert(2)</script><form><input></form>',
      },
    },
  };
  const content = sanitizeHomeContent(dirty, purifier);
  const html = render(content);

  it("strips scripts, handlers and forms from the baked WordPress HTML", () => {
    const description = html.match(/<div class="max-w-prose[^"]*">(.*?)<\/div>/)?.[1];
    expect(description).toBe("<p>Bonjour <a>x</a></p>");
    expect(html).not.toMatch(/<script>alert|onerror|javascript:/);
  });

  it("sanitizes the embedded copy of the content too", () => {
    expect(JSON.stringify(content)).not.toMatch(/onerror|<script|javascript:/);
  });
});

describe("prerender (entry-server)", () => {
  const html = render(homePage);

  it("bakes the WordPress content into the HTML", () => {
    expect(html).toMatch(/<h1[^>]*>Solution X<\/h1>/);
    expect(html).toContain("Goût unique, authentique et revigorant.");
    for (const flavor of ["Betterave", "Gingembre", "Hibiscus", "Watermelon"]) {
      expect(html).toContain(`>${flavor}</h3>`);
    }
  });

  it("renders the page landmarks and exactly one h1", () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('<main id="main"');
    expect(html).toContain("<header");
    expect(html).toContain("<footer");
  });

  it("does not hide any content before JavaScript runs", () => {
    // Reveal only hides under html.js-reveal, which the server never sets
    expect(html).not.toContain("js-reveal");
    expect(html).not.toMatch(/style="[^"]*opacity:\s*0/);
  });
});
