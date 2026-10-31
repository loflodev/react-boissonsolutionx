import AxeBuilder from "@axe-core/playwright";
import { expect, revealAll, test } from "./fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Runs on both projects (desktop and Pixel 7), including colour contrast
test("the page has no WCAG 2.2 AA violations", async ({ page }) => {
  await page.goto("/");
  await revealAll(page);

  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
});

test("the privacy policy has no WCAG 2.2 AA violations", async ({ page }) => {
  await page.goto("/politique-de-confidentialite");
  await revealAll(page);

  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
});

test.describe("mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "the menu button only shows on small screens");

  test("the open mobile menu has no violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.locator("#mobile-menu")).toHaveAttribute("data-open", "true");

    const results = await new AxeBuilder({ page }).include("header").withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});

test("form errors stay accessible", async ({ page }) => {
  await page.goto("/#contactForm");
  await page.getByRole("button", { name: /Envoyer ton message/ }).click();
  await expect(page.getByRole("textbox", { name: "Courriel *" })).toHaveAttribute("aria-invalid", "true");

  const results = await new AxeBuilder({ page }).include("form").withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
});
