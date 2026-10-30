import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/#contactForm");
});

const fill = async (page: Page) => {
  await page.getByRole("textbox", { name: "Nom Complet *" }).fill("Jean Tremblay");
  await page.getByRole("textbox", { name: "Courriel *" }).fill("jean@example.com");
  await page.getByRole("textbox", { name: "Message *" }).fill("Bonjour, je veux commander une caisse.");
};

const send = (page: Page) =>
  page.getByRole("button", { name: /Envoyer ton message/ }).click();

test("blocks an empty form and explains each field", async ({ page, graphql }) => {
  await send(page);
  await expect(page.getByRole("textbox", { name: "Nom Complet *" })).toHaveAccessibleDescription("Nom complet requis");
  await expect(page.getByRole("textbox", { name: "Courriel *" })).toHaveAccessibleDescription("Courriel requis");
  await expect(page.getByRole("textbox", { name: "Message *" })).toHaveAccessibleDescription("Message requis");
  expect(graphql.submissions).toHaveLength(0);
});

test("sends the message to WordPress and confirms", async ({ page, graphql }) => {
  await fill(page);
  await send(page);

  await expect(page.getByRole("status")).toHaveText("Merci, envoyé !");
  await expect(page.getByRole("heading", { name: "Merci, message envoyé !" })).toBeFocused();

  await page.getByRole("button", { name: "Envoyer un autre message" }).click();
  await expect(page.getByRole("textbox", { name: "Nom Complet *" })).toHaveValue("");

  expect(graphql.submissions).toHaveLength(1);
  const { input } = graphql.submissions[0].variables;
  expect(input.title).toBe("Contact from Jean Tremblay");
  expect(input.content).toBe(
    "Name: Jean Tremblay\nEmail: jean@example.com\nMessage: Bonjour, je veux commander une caisse."
  );
  // The honeypot stays empty for people
  expect(input.website).toBe("");
});

test("tells the visitor to retry when WordPress fails", async ({ page, graphql }) => {
  graphql.failNextSubmit(500);
  await fill(page);
  await send(page);

  await expect(page.getByRole("status")).toHaveText(/Veuillez réessayer plus tard/);
  await expect(page.getByRole("textbox", { name: "Nom Complet *" })).toHaveValue("Jean Tremblay");
  // No automatic retry: a slow request may have been saved already
  expect(graphql.submissions).toHaveLength(1);
});

test("a product card prefills the message with its flavor", async ({ page }) => {
  await page.getByRole("article").filter({ hasText: "Betterave" }).getByRole("link").click();

  await expect(page).toHaveURL(/#contactForm$/);
  await expect(page.getByRole("textbox", { name: "Message *" })).toHaveValue(
    "Bonjour, j'aimerais avoir plus d'informations sur SolutionX Betterave. "
  );
});
