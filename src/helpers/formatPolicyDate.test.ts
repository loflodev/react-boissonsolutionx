import { describe, expect, it } from "vitest";
import { formatPolicyDate } from "./formatPolicyDate";

describe("formatPolicyDate", () => {
  it("formats the ACF date picker values in French", () => {
    expect(formatPolicyDate("20261030")).toBe("30 octobre 2026");
    expect(formatPolicyDate("2026-10-30")).toBe("30 octobre 2026");
    expect(formatPolicyDate("2026-10-30T00:00:00+00:00")).toBe("30 octobre 2026");
  });

  it("shows other text as typed, and nothing when empty", () => {
    expect(formatPolicyDate("30 octobre 2026")).toBe("30 octobre 2026");
    expect(formatPolicyDate(null)).toBeNull();
    expect(formatPolicyDate("  ")).toBeNull();
  });
});
