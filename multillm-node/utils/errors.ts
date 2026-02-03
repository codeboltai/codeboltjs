/**
 * Error Types and Utilities for LLM Providers
 * Provides typed errors with categorization and retry information
 */

/**
 * Error codes for categorizing LLM errors
 */
export enum ErrorCode {
  /** Authentication failure (invalid API key, expired token) */
  AUTH_ERROR = 'AUTH_ERROR',
  /** Rate limit exceeded (429 errors) */
  RATE_LIMIT = 'RATE_LIMIT',
  /** Request timeout */
  TIMEOUT = 'TIMEOUT',
  /** Invalid or unsupported model */
  INVALID_MODEL = 'INVALID_MODEL',
  /** Token/context limit exceeded */
  TOKEN_LIMIT = 'TOKEN_LIMIT',
  /** Network connectivity issues */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Provider-specific error */
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  /** Invalid request parameters */
  INVALID_REQUEST = 'INVALID_REQUEST',
  /** Content filtered/blocked */
  CONTENT_FILTER = 'CONTENT_FILTER',
  /** Service unavailable */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** Unknown error */
  UNKNOWN = 'UNKNOWN'
}

/**
 * Custom error class for LLM operations
 */
export class LLMProviderError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public provider: string,
    public statusCode?: number,
    public retryable: boolean = false,
    public retryAfter?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'LLMProviderError';
  }

  /**
   * Create a JSON-serializable representation
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      provider: this.provider,
      statusCode: this.statusCode,
      retryable: this.retryable,
      retryAfter: this.retryAfter
    };
  }
}

/**
 * Determine error code from HTTP status
 */
export function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 401:
    case 403:
      return ErrorCode.AUTH_ERROR;
    case 429:
      return ErrorCode.RATE_LIMIT;
    case 400:
      return ErrorCode.INVALID_REQUEST;
    case 404:
      return ErrorCode.INVALID_MODEL;
    case 408:
      return ErrorCode.TIMEOUT;
    case 413:
      return ErrorCode.TOKEN_LIMIT;
    case 500:
    case 502:
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.PROVIDER_ERROR;
  }
}

/**
 * Check if an error is retryable based on its code
 */
export function isRetryableError(error: LLMProviderError | Error): boolean {
  if (error instanceof LLMProviderError) {
    return error.retryable;
  }

  // Check for network errors
  if (error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND')) {
    return true;
  }

  return false;
}

/**
 * Parse error from axios/fetch response
 */
export function parseProviderError(
  error: any,
  provider: string
): LLMProviderError {
  // Handle axios errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    const code = getErrorCodeFromStatus(status);

    // Extract message from various error formats
    let message = 'Unknown error';
    if (typeof data === 'string') {
      message = data;
    } else if (data?.error?.message) {
      message = data.error.message;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.detail) {
      message = data.detail;
    }

    // Check for retry-after header
    const retryAfter = error.response.headers?.['retry-after'];
    const retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : undefined;

    const retryable = code === ErrorCode.RATE_LIMIT ||
                      code === ErrorCode.SERVICE_UNAVAILABLE ||
                      code === ErrorCode.TIMEOUT;

    return new LLMProviderError(
      message,
      code,
      provider,
      status,
      retryable,
      retryAfterMs,
      error
    );
  }

  // Handle network errors
  if (error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND') {
    return new LLMProviderError(
      `Network error: ${error.message}`,
      ErrorCode.NETWORK_ERROR,
      provider,
      undefined,
      true,
      undefined,
      error
    );
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new LLMProviderError(
      `Request timeout: ${error.message}`,
      ErrorCode.TIMEOUT,
      provider,
      undefined,
      true,
      undefined,
      error
    );
  }

  // Generic error
  return new LLMProviderError(
    error.message || 'Unknown error',
    ErrorCode.UNKNOWN,
    provider,
    undefined,
    false,
    undefined,
    error
  );
}
