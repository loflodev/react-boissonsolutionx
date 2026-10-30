// @vitest-environment node
// The build-time prerender runs in Node, without a DOM
import { describe, expect, it } from "vitest";
import { render } from "./entry-server";
import { homePage } from "./test/fixtures";

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
