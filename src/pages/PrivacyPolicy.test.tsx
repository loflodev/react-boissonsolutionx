import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Footer from "../components/layouts/Footer";
import { PRIVACY_PATH } from "../entry-shared";
import { PRIVACY_PAGE_QUERY_KEY } from "../hooks/usePrivacyPageData";
import { privacyPage } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import type { PrivacyPage } from "../type";
import PrivacyPolicy, { CAI_URL } from "./PrivacyPolicy";

const renderPolicy = (page: PrivacyPage = privacyPage.page) =>
  renderWithProviders(<PrivacyPolicy />, { seed: [PRIVACY_PAGE_QUERY_KEY, { page }] });

describe("PrivacyPolicy", () => {
  it("renders the WordPress title, intro and formatted date", () => {
    renderPolicy();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Politique de confidentialité");
    expect(screen.getByText("Nous respectons votre vie privée.")).toBeInTheDocument();
    expect(screen.getByText("Dernière mise à jour : 30 octobre 2026")).toBeInTheDocument();
  });

  it("builds the table of contents from the content headings", () => {
    const { container } = renderPolicy();
    const toc = screen.getByRole("navigation", { name: "Sur cette page" });
    const links = within(toc).getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual([
      "01Portée de la politique",
      "02Témoins (cookies) & suivi",
      "03Nous joindre",
    ]);
    for (const link of links) {
      const id = link.getAttribute("href")!.slice(1);
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it("drops WordPress markup attributes", () => {
    const { container } = renderPolicy();
    expect(container.querySelector(".policy-body [class]")).toBeNull();
  });

  it("shows the officer details, linking the email", () => {
    renderPolicy();
    expect(
      screen.getByRole("heading", { name: "Responsable de la protection des renseignements personnels" })
    ).toBeInTheDocument();
    expect(screen.getByText("Jean Wilson")).toBeInTheDocument();
    expect(screen.getByText("CEO")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "vie-privee@example.test" })).toHaveAttribute(
      "href",
      "mailto:vie-privee@example.test"
    );
    expect(
      screen.getByRole("link", { name: "Commission d’accès à l’information du Québec" })
    ).toHaveAttribute("href", CAI_URL);
  });

  it("leaves out empty fields instead of showing them blank", () => {
    renderPolicy({
      ...privacyPage.page,
      politiqueDeConfidentialite: {
        ...privacyPage.page.politiqueDeConfidentialite!,
        derniereMiseAJour: null,
        officeremail: null,
      },
    });
    expect(screen.queryByText(/Dernière mise à jour/)).toBeNull();
    expect(screen.queryByText("Courriel")).toBeNull();
    expect(screen.getByText("Nom")).toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("links to the privacy policy, marked current on that page", () => {
    render(
      <MemoryRouter initialEntries={[PRIVACY_PATH]}>
        <Footer />
      </MemoryRouter>
    );
    const nav = screen.getByRole("navigation", { name: "Liens légaux" });
    const link = within(nav).getByRole("link", { name: "Politique de confidentialité" });
    expect(link).toHaveAttribute("href", PRIVACY_PATH);
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("leads back to the home sections from any page", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const nav = screen.getByRole("navigation", { name: "Navigation du pied de page" });
    for (const link of within(nav).getAllByRole("link")) {
      expect(link.getAttribute("href")).toMatch(/^\/#/);
    }
  });
});
