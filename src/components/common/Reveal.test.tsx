import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MockIntersectionObserver } from "../../test/intersectionObserver";
import Reveal from "./Reveal";

describe("Reveal", () => {
  it("keeps content in the DOM and reveals it once it scrolls into view", () => {
    render(
      <Reveal index={2}>
        <p>Contenu</p>
      </Reveal>
    );
    const wrapper = screen.getByText("Contenu").parentElement!;
    // Hidden only by CSS under html.js-reveal; crawlers still get the text
    expect(wrapper).toHaveAttribute("data-visible", "false");
    expect(wrapper.style.getPropertyValue("--i")).toBe("2");

    act(() => MockIntersectionObserver.enter(wrapper));
    expect(wrapper).toHaveAttribute("data-visible", "true");
  });

  it("can render as a list item", () => {
    render(
      <ul>
        <Reveal as="li">Élément</Reveal>
      </ul>
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Élément");
  });
});
