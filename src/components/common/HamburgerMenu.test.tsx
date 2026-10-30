import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { menu } from "../../menu";
import HamburgerMenu from "./HamburgerMenu";

const renderMenu = (activeLink: string | null = null) => {
  const onOpenChange = vi.fn();
  render(<HamburgerMenu menu={menu} activeLink={activeLink} onOpenChange={onOpenChange} />);
  const button = screen.getByRole("button", { name: "Ouvrir le menu" });
  // The nav is inert (hidden from assistive tech) while closed
  const nav = document.getElementById("mobile-menu")!;
  return { button, nav, onOpenChange };
};

describe("HamburgerMenu", () => {
  it("starts closed and inert", () => {
    const { button, nav } = renderMenu();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "mobile-menu");
    expect(nav).toHaveAttribute("inert");
    expect(nav).toHaveAttribute("data-open", "false");
  });

  it("opens and closes from the button", async () => {
    const user = userEvent.setup();
    const { button, nav, onOpenChange } = renderMenu();

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAccessibleName("Fermer le menu");
    expect(nav).not.toHaveAttribute("inert");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const { button } = renderMenu();
    await user.click(button);
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when pressing outside, but not inside the menu", async () => {
    const user = userEvent.setup();
    const { button, nav } = renderMenu();
    await user.click(button);

    fireEvent.pointerDown(nav);
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(document.body);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("closes after following a link and marks the current section", async () => {
    const user = userEvent.setup();
    const { button } = renderMenu("#about");
    await user.click(button);

    const current = screen.getByRole("link", { name: "À propos de nous" });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Produits" })).not.toHaveAttribute("aria-current");

    await user.click(current);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
