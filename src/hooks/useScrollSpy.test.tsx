import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useScrollSpy from "./useScrollSpy";

// jsdom has no layout: each section reports the top we give it
const tops: Record<string, number> = {};
const ids = ["a", "b", "c"];

const scrollTo = (next: Record<string, number>) =>
  act(() => {
    Object.assign(tops, next);
    window.dispatchEvent(new Event("scroll"));
  });

beforeEach(() => {
  // Run frames at once. Returning 0 keeps the hook free to schedule the next
  // one, as when a real (asynchronous) frame has already run
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  window.innerHeight = 1000; // reading line at 300px
  Object.defineProperty(document.documentElement, "scrollHeight", { value: 5000, configurable: true });
  for (const id of ids) {
    const el = document.createElement("section");
    el.id = id;
    el.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect;
    document.body.appendChild(el);
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
  ids.forEach((id) => document.getElementById(id)?.remove());
});

describe("useScrollSpy", () => {
  it("is empty before the first section reaches the reading line", () => {
    Object.assign(tops, { a: 600, b: 1400, c: 2200 });
    const { result } = renderHook(() => useScrollSpy(ids));
    expect(result.current).toBeNull();
  });

  it("follows the last section above the reading line, both ways", () => {
    Object.assign(tops, { a: 600, b: 1400, c: 2200 });
    const { result } = renderHook(() => useScrollSpy(ids));

    scrollTo({ a: -200, b: 250, c: 1000 });
    expect(result.current).toBe("b");

    // Back up: still reading the end of "a", whose heading is long gone
    scrollTo({ a: -100, b: 350, c: 1100 });
    expect(result.current).toBe("a");
  });

  it("picks the last section once the page bottom is reached", () => {
    Object.assign(tops, { a: -900, b: 100, c: 700 });
    window.scrollY = 4000; // 4000 + 1000 = scrollHeight
    const { result } = renderHook(() => useScrollSpy(ids));
    expect(result.current).toBe("c");
    window.scrollY = 0;
  });
});
