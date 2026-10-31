// The WordPress host's firewall sometimes refuses CI runners for a moment
// (403, 429, 5xx or a dropped connection). Retry those with a growing pause
// instead of failing the build; anything else (a bad query, a missing page)
// fails at once.
const RETRYABLE_STATUS = new Set([403, 408, 425, 429, 500, 502, 503, 504]);

// The service errors (src/type.ts) carry `statusCode`; a network failure has none
export const isRetryable = (error) =>
  error?.name === "NetworkError" &&
  (error.statusCode === undefined || RETRYABLE_STATUS.has(error.statusCode));

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async (
  task,
  { label, delays = [2000, 5000, 10000], sleep = pause, log = console.warn } = {}
) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= delays.length || !isRetryable(error)) throw error;
      log(
        `[prerender] ${label}: ${error.message}, retrying in ${delays[attempt] / 1000}s (${attempt + 1}/${delays.length})`
      );
      await sleep(delays[attempt]);
    }
  }
};
