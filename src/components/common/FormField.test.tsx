import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormField from "./FormField";

describe("FormField", () => {
  it("labels a required input", () => {
    render(
      <FormField name="email" type="email" label="Courriel *" value="" autoComplete="email" onChange={vi.fn()} />
    );
    const input = screen.getByLabelText("Courriel *");
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toBeRequired();
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("links the error message to the field", () => {
    render(
      <FormField name="email" label="Courriel *" value="x" error="Adresse courriel invalide" onChange={vi.fn()} />
    );
    // The name stays the label alone; the error is only the description
    const input = screen.getByRole("textbox", { name: "Courriel *" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Adresse courriel invalide");
  });

  it("renders a textarea when multiline", () => {
    render(<FormField name="message" label="Message *" value="" multiline onChange={vi.fn()} />);
    expect(screen.getByLabelText("Message *").tagName).toBe("TEXTAREA");
  });
});
