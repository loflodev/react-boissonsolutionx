import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Button from "./Button";

afterEach(() => {
  vi.useRealTimers();
});

describe("Button", () => {
  it("renders a plain anchor (no nested button) when used as a link", () => {
    render(<Button label="Découvrez nos produits" variant="primary" asLink to="#ourProducts" />);
    const link = screen.getByRole("link", { name: "Découvrez nos produits" });
    expect(link).toHaveAttribute("href", "#ourProducts");
    expect(link.querySelector("button")).toBeNull();
  });

  it("renders a button that forwards native props", () => {
    const onClick = vi.fn();
    render(<Button label="Envoyer" variant="primary" type="submit" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Envoyer" });
    expect(button).toHaveAttribute("type", "submit");
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps the label visible while loading", () => {
    render(<Button label="Envoyer" variant="primary" isLoading disabled />);
    const button = screen.getByRole("button", { name: "Envoyer" });
    expect(button).toBeDisabled();
    expect(button.querySelector(".animate-spin")).not.toBeNull();
  });

  it("flashes the submit result for 3 seconds, then shows the label again", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Button label="Envoyer" variant="primary" submitStatus="idle" />
    );
    rerender(
      <Button label="Envoyer" variant="primary" submitStatus="success" submitMessage="Merci, envoyé !" />
    );
    expect(screen.getByRole("button")).toHaveTextContent("Merci, envoyé !");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole("button")).toHaveTextContent("Envoyer");
  });
});
