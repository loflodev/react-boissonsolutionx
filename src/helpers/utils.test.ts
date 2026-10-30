import { describe, expect, it } from "vitest";
import { homePage } from "../test/fixtures";
import type { OurProducts } from "../type";
import { convertToArray } from "./utils";

describe("convertToArray", () => {
  it("lists the WordPress cards in order", () => {
    expect(convertToArray(homePage.page.ourProducts).map((p) => p.name)).toEqual([
      "SolutionX - Betterave",
      "SolutionX - Gingembre",
      "SolutionX - Hibiscus",
      "SolutionX - Watermelon",
    ]);
  });

  it("skips cards left empty in WordPress", () => {
    const products = {
      ...homePage.page.ourProducts,
      card3: null,
    } as unknown as OurProducts;
    expect(convertToArray(products)).toHaveLength(3);
  });
});
