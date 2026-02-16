import axios from 'axios';

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const isRetryableNetworkError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  return (
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    !error.response ||
    (typeof status === 'number' && RETRYABLE_STATUS_CODES.has(status))
  );
};

type RetryOptions = {
  timeoutsMs: number[];
  retryDelayMs?: number;
};

export const runRequestWithRetry = async <T>(
  request: (timeoutMs: number) => Promise<T>,
  { timeoutsMs, retryDelayMs = 1200 }: RetryOptions,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < timeoutsMs.length; attempt += 1) {
    try {
      return await request(timeoutsMs[attempt]);
    } catch (error) {
      lastError = error;
      const hasMoreAttempts = attempt < timeoutsMs.length - 1;
      if (!hasMoreAttempts || !isRetryableNetworkError(error)) throw error;
      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed');
};
