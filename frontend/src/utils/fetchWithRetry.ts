/**
 * Fetch with retry and exponential backoff for critical API calls.
 * Retries on network errors and 5xx responses.
 */

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  retryOn?: (response: Response) => boolean;
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const { maxRetries = DEFAULT_MAX_RETRIES, retryOn, ...fetchOptions } = options;

  const shouldRetry = (res: Response) => (retryOn ? retryOn(res) : res.status >= 500);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, fetchOptions);
      if (res.ok || !shouldRetry(res)) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
    if (attempt < maxRetries) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  throw lastError ?? new Error('Fetch failed');
}
