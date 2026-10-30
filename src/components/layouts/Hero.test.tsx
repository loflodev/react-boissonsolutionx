import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { homePage } from "../../test/fixtures";
import Hero from "./Hero";

const hero = homePage.page.heroSection;

describe("Hero", () => {
  it("shows the WordPress headline as the page h1", () => {
    render(<Hero heroData={hero} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Solution X");
    expect(screen.getByText("Boisson")).toBeInTheDocument();
    expect(screen.getByText("Goût unique, authentique et revigorant.")).toBeInTheDocument();
  });

  it("strips scripts and handlers from the WordPress description", () => {
    const { container } = render(
      <Hero
        heroData={{
          ...hero,
          description: '<p>Bonjour</p><img src="x" onerror="alert(1)"><script>alert(2)</script>',
        }}
      />
    );
    expect(screen.getByText("Bonjour")).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("[onerror]")).toBeNull();
  });

  it("links its calls to action to the products and the store locator", () => {
    render(<Hero heroData={hero} />);
    expect(screen.getByRole("link", { name: "Découvrez nos produits" })).toHaveAttribute(
      "href",
      "#ourProducts"
    );
    expect(screen.getByRole("link", { name: "Où acheter" })).toHaveAttribute("href", "#contact");
  });
});
