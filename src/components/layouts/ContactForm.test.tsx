import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SUBMIT_CONTACT_FORM_QUERY } from "../../graphql/submitContactFormQuery";
import { submitContactForm } from "../../services/homePageService";
import { renderWithProviders } from "../../test/render";
import { NetworkError, ValidationError } from "../../type";
import ContactForm from "./ContactForm";

vi.mock("../../services/homePageService", () => ({
  submitContactForm: vi.fn(),
}));

const submit = vi.mocked(submitContactForm);

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Nom Complet *"), "Jean Tremblay");
  await user.type(screen.getByLabelText("Courriel *"), "jean@example.com");
  await user.type(screen.getByLabelText("Message *"), "Bonjour, je veux commander.");
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

  it("sends the message, announces success and resets the form", async () => {
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
    expect(screen.getByLabelText("Nom Complet *")).toHaveValue("");
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
