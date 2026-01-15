/**
 * Error handling utilities
 */

interface ToolError extends Error {
  type: string;
  originalError?: unknown;
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
}

/**
 * Check if error is a Node.js error with code property
 */
export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

/**
 * Create a standardized error with type information
 */
export function createToolError(
  message: string,
  type: string,
  originalError?: unknown,
): ToolError {
  const error = new Error(message) as ToolError;
  error.type = type;
  if (originalError) {
    error.originalError = originalError;
  }
  return error;
}