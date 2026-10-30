import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HOME_PAGE_QUERY_KEY } from "../hooks/useHomePageData";
import { getHomePageData } from "../services/homePageService";
import { homePage } from "../test/fixtures";
import { renderWithProviders } from "../test/render";
import { NetworkError, ValidationError } from "../type";
import Home from "./Home";

vi.mock("../services/homePageService", () => ({
  getHomePageData: vi.fn(),
  submitContactForm: vi.fn(),
}));

const getData = vi.mocked(getHomePageData);

beforeEach(() => {
  getData.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Home", () => {
  it("shows a spinner for the WordPress sections, but the static ones right away", () => {
    getData.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Home />);

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.getByRole("heading", { name: "Nous Contacter" })).toBeInTheDocument();
    expect(screen.getByLabelText("Courriel *")).toBeInTheDocument();
  });

  it("renders the hero and products once WordPress answers", async () => {
    getData.mockResolvedValue(homePage);
    renderWithProviders(<Home />);

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Solution X");
    expect(screen.getAllByRole("article")).toHaveLength(4);
  });

  it("shows an error with a retry button when nothing could be loaded", async () => {
    getData.mockRejectedValue(new ValidationError("bad query"));
    renderWithProviders(<Home />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Erreur de chargement");
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  });

  it("keeps the prerendered content when the background refresh fails", async () => {
    getData.mockRejectedValue(new NetworkError("WordPress is down"));
    const { queryClient } = renderWithProviders(<Home />, {
      seed: [HOME_PAGE_QUERY_KEY, homePage],
    });

    // Let the refetch (and its retries) fail
    await waitFor(() =>
      expect(queryClient.getQueryState(HOME_PAGE_QUERY_KEY)?.status).toBe("error")
    );
    expect(getData).toHaveBeenCalledTimes(4);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Solution X");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
