import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { homePage, makeProduct } from "../../test/fixtures";
import { convertToArray } from "../../helpers/utils";
import OurProduct from "./OurProduct";

const products = convertToArray(homePage.page.ourProducts);

describe("OurProduct", () => {
  it("titles each card with the flavor and labels it with the range", () => {
    render(<OurProduct products={products} />);
    expect(screen.getByRole("heading", { level: 2, name: "Nos Produits" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)
    ).toEqual(["Betterave", "Gingembre", "Hibiscus", "Watermelon"]);
    expect(screen.getAllByText("SolutionX")).toHaveLength(4);
  });

  it("keeps names without a range whole", () => {
    render(<OurProduct products={[makeProduct("Édition limitée", "limitee")]} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Édition limitée");
  });

  it("serves responsive, lazy images with known dimensions", () => {
    render(<OurProduct products={products} />);
    const img = screen.getByRole("img", { name: "SolutionX - Betterave" });
    expect(img).toHaveAttribute("src", "https://api.example.test/uploads/betterave.webp");
    expect(img.getAttribute("srcset")).toContain("betterave-300x300.webp 300w");
    expect(img.getAttribute("sizes")).toMatch(/calc\(100vw - 3rem\)$/);
    expect(img).toHaveAttribute("width", "1024");
    expect(img).toHaveAttribute("height", "1024");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("points every card CTA to the contact form", () => {
    render(<OurProduct products={products} />);
    const card = screen.getAllByRole("article")[0];
    expect(within(card).getByRole("link", { name: "Commander" })).toHaveAttribute(
      "href",
      "#contactForm"
    );
    expect(within(card).getByText("500 mL")).toBeInTheDocument();
  });
});
