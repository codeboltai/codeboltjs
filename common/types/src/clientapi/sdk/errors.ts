/** Error codes for SDK errors */
export enum CodeBoltErrorCode {
  UNKNOWN = 'UNKNOWN',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  REQUEST_FAILED = 'REQUEST_FAILED',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  SOCKET_ERROR = 'SOCKET_ERROR',
  SOCKET_CLOSED = 'SOCKET_CLOSED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR'
}

/** API error details */
export interface CodeBoltApiErrorDetails {
  status: number;
  statusText: string;
  url: string;
  method: string;
  data?: unknown;
}

/** Socket error details */
export interface CodeBoltSocketErrorDetails {
  socketUrl: string;
  state: string;
  code?: number;
  reason?: string;
}
