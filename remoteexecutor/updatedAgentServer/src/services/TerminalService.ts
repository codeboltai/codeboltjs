import { logger } from '../utils/logger';
import { spawn } from 'node:child_process';
import * as os from 'node:os';
import type { ConfigManager } from '../codeboltTools/config';

/**
 * Configuration interface for TerminalService
 */
export interface TerminalServiceConfig {
  /** Target directory for operations */
  targetDir: string;
  
  /** Workspace context */
  workspaceContext?: any;
  
  /** Debug mode */
  debugMode?: boolean;
  
  /** Timeout for operations */
  timeout?: number;
}

/**
 * Command execution result interface
 */
export interface CommandResult {
  output: string;
  error: Error | null;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  aborted: boolean;
}

/**
 * Terminal Service class providing standalone command execution functions
 */
export class TerminalService {
  private static instances: Map<string, TerminalService> = new Map();
  private config: TerminalServiceConfig;
  
  private constructor(config: TerminalServiceConfig) {
    this.config = config;
  }

  public static getInstance(config: TerminalServiceConfig): TerminalService {
    const instanceKey = config.targetDir;
    
    if (!TerminalService.instances.has(instanceKey)) {
      TerminalService.instances.set(instanceKey, new TerminalService(config));
    }
    return TerminalService.instances.get(instanceKey)!;
  }

  /**
   * Execute a shell command
   */
  async executeCommand(
    command: string,
    options?: {
      directory?: string;
      timeout?: number;
      updateOutput?: (output: string) => void;
    }
  ): Promise<CommandResult> {
    const cwd = options?.directory
      ? require('path').resolve(this.config.targetDir, options.directory)
      : this.config.targetDir;

    const timeout = options?.timeout || this.config.timeout || 30000;

    return new Promise((resolve) => {
      const isWindows = os.platform() === 'win32';
      const shell = isWindows ? 'cmd.exe' : 'bash';
      const shellArgs = isWindows ? ['/c', command] : ['-c', command];

      const child = spawn(shell, shellArgs, {
        cwd,
        stdio: 'pipe',
        windowsHide: true,
      });

      let output = '';
      let error: Error | null = null;
      let aborted = false;
      let timeoutId: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        child.kill('SIGTERM');
      };

      // Set up timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          aborted = true;
          logger.warn(`Command timed out after ${timeout}ms: ${command}`);
          cleanup();
        }, timeout);
      }

      child.stdout?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        options?.updateOutput?.(output);
      });

      child.stderr?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        options?.updateOutput?.(output);
      });

      child.on('error', (err) => {
        error = err;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      });

      child.on('close', (code, sig) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        resolve({
          output,
          error,
          exitCode: code,
          signal: sig,
          aborted,
        });
      });
    });
  }

  /**
   * Check if a command is available in the system's PATH
   */
  isCommandAvailable(command: string): Promise<boolean> {
    return new Promise((resolve) => {
      const checkCommand = os.platform() === 'win32' ? 'where' : 'command';
      const checkArgs = os.platform() === 'win32' ? [command] : ['-v', command];
      
      try {
        const child = spawn(checkCommand, checkArgs, {
          stdio: 'ignore',
          shell: os.platform() === 'win32',
        });
        
        child.on('close', (code) => resolve(code === 0));
        child.on('error', () => resolve(false));
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Get command description based on platform
   */
  getCommandDescription(): string {
    if (os.platform() === 'win32') {
      return 'Exact command to execute as `cmd.exe /c <command>`';
    } else {
      return 'Exact bash command to execute as `bash -c <command>`';
    }
  }

  /**
   * Get shell description based on platform
   */
  getShellDescription(): string {
    const returnedInfo = `

The following information is returned:

Command: Executed command.
Directory: Directory (relative to project root) where command was executed, or (root).
Output: Combined stdout and stderr output. Can be (empty) or partial on error.
Error: Error or (none) if no error was reported for the subprocess.
Exit Code: Exit code or (none) if terminated by signal.
Signal: Signal number or (none) if no signal was received.`;

    if (os.platform() === 'win32') {
      return `This tool executes a given shell command as \`cmd.exe /c <command>\`.${returnedInfo}`;
    } else {
      return `This tool executes a given shell command as \`bash -c <command>\`.${returnedInfo}`;
    }
  }
}

/**
 * Create a default TerminalService instance using singleton pattern
 */
export function createTerminalService(config: TerminalServiceConfig): TerminalService {
  return TerminalService.getInstance(config);
}

/**
 * Export all the core functions for standalone use
 */
export const terminalServiceFunctions = {
  executeCommand: (config: TerminalServiceConfig, command: string, options?: any) =>
    TerminalService.getInstance(config).executeCommand(command, options),
  isCommandAvailable: (config: TerminalServiceConfig, command: string) =>
    TerminalService.getInstance(config).isCommandAvailable(command),
  getCommandDescription: (config: TerminalServiceConfig) =>
    TerminalService.getInstance(config).getCommandDescription(),
  getShellDescription: (config: TerminalServiceConfig) =>
    TerminalService.getInstance(config).getShellDescription(),
};