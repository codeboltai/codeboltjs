/**
 * Terminal SDK Function Types
 * Types for the cbterminal module functions
 */

// Base response interface for terminal operations
export interface BaseTerminalSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Command execution responses
export interface CommandOutput extends BaseTerminalSDKResponse {
  output: string;
  stdout?: string;
  stderr?: string;
}

export interface CommandError extends BaseTerminalSDKResponse {
  error: string;
  exitCode?: number;
  stderr?: string;
}

export interface CommandFinish extends BaseTerminalSDKResponse {
  exitCode: number;
  stdout?: string;
  stderr?: string;
}

// Terminal interrupt responses
export interface TerminalInterruptResponse extends BaseTerminalSDKResponse {
  interrupted?: boolean;
}

export interface TerminalInterrupted extends BaseTerminalSDKResponse {
  interrupted: boolean;
}

// Execute command response
export interface TerminalExecuteResponse extends BaseTerminalSDKResponse {
  status_code?: number;
  result?: string;
  output?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}
