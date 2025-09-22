/**
 * @fileoverview E2B Sandbox Type Definitions
 * @description Type definitions for E2B sandbox interfaces and implementations
 */

/**
 * E2B Sandbox interface (simplified for implementation)
 * In a real implementation, this would import from the E2B SDK
 */
export interface E2BSandbox {
  id: string;
  create(): Promise<void>;
  destroy(): Promise<void>;
  filesystem: {
    write(path: string, content: string): Promise<void>;
    read(path: string): Promise<string>;
    exists(path: string): Promise<boolean>;
    list(path: string): Promise<string[]>;
    mkdir(path: string): Promise<void>;
    rm(path: string, recursive?: boolean): Promise<void>;
  };
  git: {
    getDiff(): Promise<string>;
    status(): Promise<any>;
    add(files: string[]): Promise<void>;
    commit(message: string): Promise<void>;
    push(): Promise<void>;
    pull(): Promise<void>;
  };
  terminal: {
    run(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }>;
  };
}

/**
 * Sandbox configuration interface
 */
export interface SandboxConfig {
  id?: string;
  template?: string;
  timeout?: number;
  env?: Record<string, string>;
}

/**
 * Git status result interface
 */
export interface GitStatus {
  modified: string[];
  added: string[];
  deleted: string[];
  untracked?: string[];
}

/**
 * Terminal execution result interface
 */
export interface TerminalResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Filesystem operation options interface
 */
export interface FilesystemOptions {
  recursive?: boolean;
  force?: boolean;
  mode?: string;
}