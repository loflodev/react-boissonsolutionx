import { describe, expect, it, vi } from "vitest";
import { isRetryable, withRetry } from "./retry.mjs";

const networkError = (statusCode) =>
  Object.assign(new Error(`HTTP ${statusCode}`), { name: "NetworkError", statusCode });

const options = { label: "home", delays: [10, 20], sleep: vi.fn(async () => {}), log: vi.fn() };

describe("isRetryable", () => {
  it("retries firewall blocks, rate limits, server and connection errors", () => {
    for (const status of [403, 429, 500, 503]) expect(isRetryable(networkError(status))).toBe(true);
    expect(isRetryable(networkError(undefined))).toBe(true);
  });

  it("does not retry client errors or GraphQL errors", () => {
    expect(isRetryable(networkError(404))).toBe(false);
    expect(isRetryable(Object.assign(new Error("x"), { name: "GraphQLServiceError" }))).toBe(false);
  });
});

describe("withRetry", () => {
  it("returns as soon as an attempt succeeds, pausing in between", async () => {
    const task = vi.fn().mockRejectedValueOnce(networkError(403)).mockResolvedValue("ok");
    const sleep = vi.fn(async () => {});
    await expect(withRetry(task, { ...options, sleep })).resolves.toBe("ok");
    expect(task).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(10);
  });

  it("gives up after the last delay with the original error", async () => {
    const task = vi.fn().mockRejectedValue(networkError(403));
    await expect(withRetry(task, options)).rejects.toThrow("HTTP 403");
    expect(task).toHaveBeenCalledTimes(3);
  });

  it("fails at once on an error retrying cannot fix", async () => {
    const task = vi.fn().mockRejectedValue(networkError(404));
    await expect(withRetry(task, options)).rejects.toThrow("HTTP 404");
    expect(task).toHaveBeenCalledTimes(1);
  });
});
