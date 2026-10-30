import { describe, expect, it } from "vitest";
import { CONTACT_LIMITS, validateContactForm } from "./validateContactForm";

const valid = {
  fullName: "Jean Tremblay",
  email: "jean@example.com",
  message: "Bonjour, je veux commander.",
};

describe("validateContactForm", () => {
  it("returns no errors for valid data", () => {
    expect(validateContactForm(valid)).toEqual({});
  });

  it("requires every field", () => {
    expect(
      validateContactForm({ fullName: " ", email: "", message: "" })
    ).toEqual({
      fullName: "Nom complet requis",
      email: "Courriel requis",
      message: "Message requis",
    });
  });

  it("rejects an invalid email", () => {
    expect(validateContactForm({ ...valid, email: "jean@" })).toEqual({
      email: "Adresse courriel invalide",
    });
  });

  it("rejects a message shorter than 10 characters", () => {
    expect(validateContactForm({ ...valid, message: "  court  " })).toEqual({
      message: "Le message doit contenir au moins 10 caractères",
    });
  });

  it("rejects fields longer than the server accepts", () => {
    expect(
      validateContactForm({
        fullName: "a".repeat(CONTACT_LIMITS.fullName + 1),
        email: `${"a".repeat(CONTACT_LIMITS.email)}@example.com`,
        message: "a".repeat(CONTACT_LIMITS.message + 1),
      })
    ).toEqual({
      fullName: "Le nom ne peut pas dépasser 100 caractères",
      email: "Adresse courriel invalide",
      message: "Le message ne peut pas dépasser 4000 caractères",
    });
  });
});
