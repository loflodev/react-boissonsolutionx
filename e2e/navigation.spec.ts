import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// Viewport-specific skips are declared per describe, so they apply before beforeEach runs
test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard and desktop navigation");

  test("the first Tab reaches the skip link, which jumps to the content", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("the header shows the section in view as current", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Navigation principale" });

    await nav.getByRole("link", { name: "À propos de nous" }).click();
    await expect(page).toHaveURL(/#about$/);
    await expect(nav.getByRole("link", { name: "À propos de nous" })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });
});

test.describe("mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu button only shows on small screens");

  test("the mobile menu opens, navigates and closes", async ({ page }) => {
    // Its name switches between "Ouvrir le menu" and "Fermer le menu"
    const toggle = page.locator('button[aria-controls="mobile-menu"]');
    const menu = page.getByRole("navigation", { name: "Menu mobile" });

    await expect(toggle).toHaveAccessibleName("Ouvrir le menu");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveAccessibleName("Fermer le menu");

    await menu.getByRole("link", { name: "Produits" }).click();
    await expect(page).toHaveURL(/#ourProducts$/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

test("the header turns opaque once the page scrolls", async ({ page }) => {
  const header = page.locator("header");
  await expect(header).toHaveAttribute("data-scrolled", "false");
  await page.mouse.wheel(0, 600);
  await expect(header).toHaveAttribute("data-scrolled", "true");
});

test("the hero calls to action lead to their sections", async ({ page }) => {
  await page.getByRole("link", { name: "Découvrez nos produits" }).click();
  await expect(page).toHaveURL(/#ourProducts$/);
  await expect(page.getByRole("heading", { name: "Nos Produits" })).toBeInViewport();
});

test("the browser console stays clean", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload({ waitUntil: "networkidle" });
  expect(errors).toEqual([]);
});
