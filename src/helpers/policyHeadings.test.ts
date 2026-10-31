import { describe, expect, it } from "vitest";
import { addHeadingIds } from "./policyHeadings";

describe("addHeadingIds", () => {
  it("gives each h2 an accent-free id and lists it for the table of contents", () => {
    const { html, headings } = addHeadingIds(
      "<h2>Portée de la politique</h2><p>x</p><h2>Témoins (cookies) &amp; <strong>suivi</strong></h2>"
    );
    expect(headings).toEqual([
      { id: "portee-de-la-politique", title: "Portée de la politique" },
      { id: "temoins-cookies-suivi", title: "Témoins (cookies) & suivi" },
    ]);
    expect(html).toBe(
      '<h2 id="portee-de-la-politique">Portée de la politique</h2><p>x</p>' +
        '<h2 id="temoins-cookies-suivi">Témoins (cookies) &amp; <strong>suivi</strong></h2>'
    );
  });

  it("keeps ids unique when two headings share a title", () => {
    const { headings } = addHeadingIds("<h2>Droits</h2><h2>Droits</h2><h2>!!</h2>");
    expect(headings.map((h) => h.id)).toEqual(["droits", "droits-2", "section"]);
  });

  it("leaves content without h2 untouched", () => {
    expect(addHeadingIds("<p>Texte</p>")).toEqual({ html: "<p>Texte</p>", headings: [] });
  });
});
