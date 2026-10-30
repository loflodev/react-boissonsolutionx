import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SUBMIT_CONTACT_FORM_QUERY } from "../../graphql/submitContactFormQuery";
import { submitContactForm } from "../../services/homePageService";
import { renderWithProviders } from "../../test/render";
import { NetworkError, ValidationError } from "../../type";
import { SUCCESS_PANEL_MS } from "../../hooks/useContactFormQuery";
import ContactForm, { type Inquiry } from "./ContactForm";

vi.mock("../../services/homePageService", () => ({
  submitContactForm: vi.fn(),
}));

const submit = vi.mocked(submitContactForm);

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Nom Complet *"), "Jean Tremblay");
  await user.type(screen.getByLabelText("Courriel *"), "jean@example.com");
  await user.type(screen.getByLabelText("Message *"), "Bonjour, je veux commander.");
};

// Re-render with a new inquiry inside the same providers (and query cache)
const renderInquiry = (inquiry?: Inquiry) => {
  const view = renderWithProviders(<ContactForm inquiry={inquiry} />);
  return {
    ...view,
    pick: (next: Inquiry) =>
      view.rerender(
        <QueryClientProvider client={view.queryClient}>
          <MemoryRouter>
            <ContactForm inquiry={next} />
          </MemoryRouter>
        </QueryClientProvider>
      ),
  };
};

const sendButton = () => screen.getByRole("button", { name: /Envoyer ton message/ });

beforeEach(() => {
  submit.mockReset();
  // The hook logs failed submissions; keep the test output clean
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContactForm", () => {
  it("flags every empty field on submit and sends nothing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await user.click(sendButton());

    expect(screen.getByLabelText("Nom Complet *")).toHaveAccessibleDescription("Nom complet requis");
    expect(screen.getByLabelText("Courriel *")).toHaveAccessibleDescription("Courriel requis");
    expect(screen.getByLabelText("Message *")).toHaveAccessibleDescription("Message requis");
    expect(submit).not.toHaveBeenCalled();
  });

  it("checks the email when leaving the field, and clears the error while typing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    const email = screen.getByLabelText("Courriel *");

    await user.type(email, "jean@");
    await user.tab();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Adresse courriel invalide");

    await user.type(email, "example.com");
    expect(email).not.toHaveAttribute("aria-invalid");
  });

  it("does not nag about empty fields when tabbing through", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);
    await user.click(screen.getByLabelText("Nom Complet *"));
    await user.tab();
    expect(screen.getByLabelText("Nom Complet *")).not.toHaveAttribute("aria-invalid");
  });

  it("sends the message, then swaps the form for a confirmation", async () => {
    submit.mockResolvedValue({ data: { createContactMessage: { clientMutationId: "x" } } });
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await fillForm(user);
    await user.click(sendButton());

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Merci, envoyé !"));
    expect(submit).toHaveBeenCalledWith(SUBMIT_CONTACT_FORM_QUERY, {
      fullName: "Jean Tremblay",
      email: "jean@example.com",
      message: "Bonjour, je veux commander.",
      website: "",
    });
    const heading = screen.getByRole("heading", { name: "Merci, message envoyé !" });
    expect(heading).toHaveFocus();
    expect(screen.queryByLabelText("Nom Complet *")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Envoyer un autre message" }));
    expect(screen.getByLabelText("Nom Complet *")).toHaveValue("");
  });

  it("brings the empty form back on its own after a while", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    submit.mockResolvedValue({ data: { createContactMessage: { clientMutationId: "x" } } });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<ContactForm />);

    await fillForm(user);
    await user.click(sendButton());
    await screen.findByRole("heading", { name: "Merci, message envoyé !" });

    act(() => vi.advanceTimersByTime(SUCCESS_PANEL_MS));
    expect(screen.getByLabelText("Message *")).toHaveValue("");
    vi.useRealTimers();
  });

  it("prefills the message with the product the visitor picked", () => {
    const { pick } = renderInquiry({ product: "SolutionX Betterave", at: 1 });
    expect(screen.getByLabelText("Message *")).toHaveValue(
      "Bonjour, j'aimerais avoir plus d'informations sur SolutionX Betterave. "
    );

    // A second pick replaces our own text
    pick({ product: "SolutionX Hibiscus", at: 2 });
    expect(screen.getByLabelText("Message *")).toHaveValue(
      "Bonjour, j'aimerais avoir plus d'informations sur SolutionX Hibiscus. "
    );
  });

  it("never overwrites a message the visitor wrote", async () => {
    const user = userEvent.setup();
    const { pick } = renderInquiry();
    await user.type(screen.getByLabelText("Message *"), "Ma propre question");

    pick({ product: "SolutionX Betterave", at: 1 });
    expect(screen.getByLabelText("Message *")).toHaveValue("Ma propre question");
  });

  it("reports a GraphQL rejection without clearing the form", async () => {
    submit.mockResolvedValue({ errors: [{ message: "Too many messages" }] });
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await fillForm(user);
    await user.click(sendButton());

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Soumission échouée !"));
    expect(screen.getByLabelText("Nom Complet *")).toHaveValue("Jean Tremblay");
  });

  it("asks to check the fields when the service rejects them", async () => {
    submit.mockRejectedValue(new ValidationError("All fields are required"));
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await fillForm(user);
    await user.click(sendButton());

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Veuillez vérifier vos informations")
    );
  });

  it("asks to retry later on a network failure, without retrying itself", async () => {
    submit.mockRejectedValue(new NetworkError("Network error"));
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await fillForm(user);
    await user.click(sendButton());

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Veuillez réessayer plus tard")
    );
    expect(submit).toHaveBeenCalledOnce();
  });

  it("disables the button while sending", async () => {
    submit.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderWithProviders(<ContactForm />);

    await fillForm(user);
    await user.click(sendButton());

    await waitFor(() => expect(sendButton()).toBeDisabled());
  });

  it("keeps the honeypot out of reach of people", () => {
    const { container } = renderWithProviders(<ContactForm />);
    const honeypot = container.querySelector('input[name="website"]')!;
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    // jsdom has no Tailwind CSS, so check the class that hides it
    expect(honeypot).toHaveClass("hidden");
  });
});
