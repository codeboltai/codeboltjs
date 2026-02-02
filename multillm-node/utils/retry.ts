/**
 * Retry Utilities for LLM Providers
 * Provides exponential backoff retry logic with configurable options
 */

import { LLMProviderError, isRetryableError } from './errors';

/**
 * Options for retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial backoff delay in ms (default: 1000) */
  initialBackoff?: number;
  /** Maximum backoff delay in ms (default: 30000) */
  maxBackoff?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Add jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Custom function to determine if error is retryable */
  shouldRetry?: (error: Error) => boolean;
  /** Callback for each retry attempt */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry' | 'signal'>> = {
  maxRetries: 3,
  initialBackoff: 1000,
  maxBackoff: 30000,
  backoffMultiplier: 2,
  jitter: true
};

/**
 * Sleep for a specified duration
 * @param ms - Duration in milliseconds
 * @param signal - Optional AbortSignal for cancellation
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Aborted'));
    });
  });
}

/**
 * Calculate backoff delay with optional jitter
 */
function calculateBackoff(
  attempt: number,
  initialBackoff: number,
  maxBackoff: number,
  multiplier: number,
  jitter: boolean,
  retryAfter?: number
): number {
  // If provider specified retry-after, respect it
  if (retryAfter) {
    return Math.min(retryAfter, maxBackoff);
  }

  // Calculate exponential backoff
  let delay = initialBackoff * Math.pow(multiplier, attempt);
  delay = Math.min(delay, maxBackoff);

  // Add jitter (0-25% of delay)
  if (jitter) {
    delay += Math.random() * delay * 0.25;
  }

  return Math.floor(delay);
}

/**
 * Execute a function with retry logic
 * @param fn - Async function to execute
 * @param options - Retry options
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;
  let retryAfter: number | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Check for cancellation
      if (opts.signal?.aborted) {
        throw new Error('Aborted');
      }

      return await fn();
    } catch (error: any) {
      lastError = error;

      // Get retry-after from LLMProviderError if available
      if (error instanceof LLMProviderError) {
        retryAfter = error.retryAfter;
      }

      // Check if we should retry
      const shouldRetry = opts.shouldRetry?.(error) ?? isRetryableError(error);

      if (!shouldRetry || attempt >= opts.maxRetries) {
        throw error;
      }

      // Calculate delay
      const delay = calculateBackoff(
        attempt,
        opts.initialBackoff,
        opts.maxBackoff,
        opts.backoffMultiplier,
        opts.jitter,
        retryAfter
      );

      // Notify callback
      opts.onRetry?.(error, attempt + 1, delay);

      // Wait before retrying
      await sleep(delay, opts.signal);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Create a retryable version of a function
 * @param fn - Async function to wrap
 * @param options - Retry options
 * @returns Wrapped function with retry logic
 */
export function withRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withRetry(() => fn(...args), options);
  }) as T;
}
