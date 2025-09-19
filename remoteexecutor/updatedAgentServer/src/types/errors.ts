/**
 * Custom error types for the system
 */

export class CodeboltError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'CodeboltError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends CodeboltError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class ConnectionError extends CodeboltError {
  constructor(message: string) {
    super(message, 'CONNECTION_ERROR', 503);
    this.name = 'ConnectionError';
  }
}

export class FileOperationError extends CodeboltError {
  constructor(message: string, filePath?: string) {
    super(message, 'FILE_OPERATION_ERROR', 500);
    this.name = 'FileOperationError';
    if (filePath) {
      this.message = `${message} (file: ${filePath})`;
    }
  }
}

export class AgentNotAvailableError extends CodeboltError {
  constructor() {
    super('No agents available to handle the request', 'AGENT_NOT_AVAILABLE', 503);
    this.name = 'AgentNotAvailableError';
  }
}

export class ClientNotFoundError extends CodeboltError {
  constructor(clientId: string) {
    super(`Client ${clientId} not found`, 'CLIENT_NOT_FOUND', 404);
    this.name = 'ClientNotFoundError';
  }
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    details?: unknown;
  };
}