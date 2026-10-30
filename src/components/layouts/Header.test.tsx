import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MockIntersectionObserver } from "../../test/intersectionObserver";
import Header from "./Header";

describe("Header", () => {
  it("offers a skip link to the main content first", () => {
    render(<Header />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Aller au contenu");
    expect(links[0]).toHaveAttribute("href", "#main");
  });

  it("lists every section in the main navigation", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "#hero",
      "#ourProducts",
      "#about",
      "#contact",
    ]);
  });

  it("turns into material once the page scrolls under it", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header")!;
    expect(header).toHaveAttribute("data-scrolled", "false");

    act(() => {
      window.scrollY = 200;
      fireEvent.scroll(window);
    });
    expect(header).toHaveAttribute("data-scrolled", "true");

    act(() => {
      window.scrollY = 0;
      fireEvent.scroll(window);
    });
    expect(header).toHaveAttribute("data-scrolled", "false");
  });

  it("marks the section under the header as current", () => {
    const section = document.createElement("section");
    section.id = "about";
    document.body.appendChild(section);

    render(<Header />);
    act(() => MockIntersectionObserver.enter(section));

    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    expect(within(nav).getByRole("link", { name: "À propos de nous" })).toHaveAttribute(
      "aria-current",
      "true"
    );
    section.remove();
  });

  it("also tracks sections that mount after it, like the CMS-driven hero", async () => {
    render(<Header />);

    // WordPress data arrives later: the hero only now joins the page
    const hero = document.createElement("section");
    hero.id = "hero";
    await act(async () => {
      document.body.appendChild(hero);
    });
    act(() => MockIntersectionObserver.enter(hero));

    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    expect(within(nav).getByRole("link", { name: "Accueil" })).toHaveAttribute(
      "aria-current",
      "true"
    );
    hero.remove();
  });
});
