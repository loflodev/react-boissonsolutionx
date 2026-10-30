import axe from "axe-core";
import { describe, expect, it } from "vitest";
import App from "./App";
import { HOME_PAGE_QUERY_KEY } from "./hooks/useHomePageData";
import { homePage } from "./test/fixtures";
import { renderWithProviders } from "./test/render";

// Fast structural check of the whole page in jsdom. Colour contrast needs real
// layout and rendering, so it is covered by the Playwright suite (e2e/a11y.spec.ts).
describe("accessibility (axe, jsdom)", () => {
  it("has no WCAG 2.2 A/AA violations", async () => {
    const { container } = renderWithProviders(<App />, {
      seed: [HOME_PAGE_QUERY_KEY, homePage],
    });
    // The seeded query renders synchronously; guard against auditing an empty tree
    expect(container.querySelector("h1")).not.toBeNull();

    const results = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      rules: { "color-contrast": { enabled: false } },
      iframes: false,
    });
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });
});
