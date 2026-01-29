/**
 * Terminal SDK Function Types
 * Types for the cbterminal module functions
 */

// Base response interface for terminal operations
export interface BaseTerminalSDKResponse {
  type?: string;
  success?: boolean;
  message?: string;
  error?: string;
}

// Command execution responses
export interface CommandOutput extends BaseTerminalSDKResponse {
  type?: 'commandOutput';
  output: string;
  stdout?: string;
  stderr?: string;
}

export interface CommandError extends BaseTerminalSDKResponse {
  type?: 'commandError';
  error: string;
  exitCode?: number;
  stderr?: string;
}

export interface CommandFinish extends BaseTerminalSDKResponse {
  type?: 'commandFinish';
  exitCode: number;
  stdout?: string;
  stderr?: string;
}

// Terminal interrupt responses
export interface TerminalInterruptResponse extends BaseTerminalSDKResponse {
  type?: 'terminalInterruptResponse';
  interrupted?: boolean;
}

export interface TerminalInterrupted extends BaseTerminalSDKResponse {
  type?: 'terminalInterrupted';
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

/**
 * Union type for terminal stream responses
 */
export type TerminalStreamResponse = CommandOutput | CommandError | CommandFinish;
