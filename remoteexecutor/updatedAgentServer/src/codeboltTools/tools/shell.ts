/**
 * Shell Tool - Executes shell commands
 */

import * as os from 'node:os';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import type {
  ToolInvocation,
  ToolResult,
  ToolCallConfirmationDetails,
  ToolExecuteConfirmationDetails,
  ToolConfirmationOutcome,
  ToolErrorType,
} from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import { getErrorMessage } from '../utils/errors';
import type { ConfigManager } from '../config';

export interface ShellToolParams {
  command: string;
  description?: string;
  directory?: string;
}

interface ShellResult {
  output: string;
  error: Error | null;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  aborted: boolean;
}

class ShellToolInvocation extends BaseToolInvocation<ShellToolParams, ToolResult> {
  private static readonly allowlist: Set<string> = new Set();

  constructor(
    private readonly config: ConfigManager,
    params: ShellToolParams,
  ) {
    super(params);
  }

  getDescription(): string {
    let description = `${this.params.command}`;
    if (this.params.directory) {
      description += ` [in ${this.params.directory}]`;
    }
    if (this.params.description) {
      description += ` (${this.params.description.replace(/\n/g, ' ')})`;
    }
    return description;
  }

  override async shouldConfirmExecute(
    _abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    if (this.config.getApprovalMode() === 'auto') {
      return false;
    }

    const command = this.params.command;
    const rootCommand = this.extractRootCommand(command);

    if (ShellToolInvocation.allowlist.has(rootCommand)) {
      return false; // already approved
    }

    const confirmationDetails: ToolExecuteConfirmationDetails = {
      type: 'exec',
      title: 'Confirm Shell Command',
      command: this.params.command,
      rootCommand,
      onConfirm: async (outcome: ToolConfirmationOutcome) => {
        if (outcome === 'proceed_always') {
          ShellToolInvocation.allowlist.add(rootCommand);
        }
      },
    };
    return confirmationDetails;
  }

  private extractRootCommand(command: string): string {
    // Simple extraction of the first command
    const trimmed = command.trim();
    const firstSpace = trimmed.indexOf(' ');
    return firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace);
  }

  async execute(
    signal: AbortSignal,
    updateOutput?: (output: string) => void,
  ): Promise<ToolResult> {
    if (signal.aborted) {
      return {
        llmContent: 'Command was cancelled by user before it could start.',
        returnDisplay: 'Command cancelled by user.',
      };
    }

    const cwd = this.params.directory
      ? path.resolve(this.config.getTargetDir(), this.params.directory)
      : this.config.getTargetDir();

    try {
      const result = await this.executeShellCommand(
        this.params.command,
        cwd,
        signal,
        updateOutput,
      );

      let llmContent = '';
      if (result.aborted) {
        llmContent = 'Command was cancelled by user before it could complete.';
        if (result.output.trim()) {
          llmContent += ` Below is the output before it was cancelled:\n${result.output}`;
        } else {
          llmContent += ' There was no output before it was cancelled.';
        }
      } else {
        llmContent = [
          `Command: ${this.params.command}`,
          `Directory: ${this.params.directory || '(root)'}`,
          `Output: ${result.output || '(empty)'}`,
          `Error: ${result.error?.message || '(none)'}`,
          `Exit Code: ${result.exitCode ?? '(none)'}`,
          `Signal: ${result.signal ?? '(none)'}`,
        ].join('\n');
      }

      let returnDisplayMessage = '';
      if (this.config.getDebugMode()) {
        returnDisplayMessage = llmContent;
      } else {
        if (result.output.trim()) {
          returnDisplayMessage = result.output;
        } else {
          if (result.aborted) {
            returnDisplayMessage = 'Command cancelled by user.';
          } else if (result.signal) {
            returnDisplayMessage = `Command terminated by signal: ${result.signal}`;
          } else if (result.error) {
            returnDisplayMessage = `Command failed: ${getErrorMessage(result.error)}`;
          } else if (result.exitCode !== null && result.exitCode !== 0) {
            returnDisplayMessage = `Command exited with code: ${result.exitCode}`;
          }
        }
      }

      const executionError = result.error
        ? {
          error: {
            message: result.error.message,
            type: 'shell_execute_error' as ToolErrorType,
          },
        }
        : {};

      return {
        llmContent,
        returnDisplay: returnDisplayMessage,
        ...executionError,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      return {
        llmContent: `Error executing command: ${errorMessage}`,
        returnDisplay: `Error: ${errorMessage}`,
        error: {
          message: errorMessage,
          type: 'shell_execute_error' as ToolErrorType,
        },
      };
    }
  }

  private async executeShellCommand(
    command: string,
    cwd: string,
    signal: AbortSignal,
    updateOutput?: (output: string) => void,
  ): Promise<ShellResult> {
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

      const cleanup = () => {
        if (signal.aborted && !aborted) {
          aborted = true;
          child.kill('SIGTERM');
        }
      };

      signal.addEventListener('abort', cleanup, { once: true });

      child.stdout?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        updateOutput?.(output);
      });

      child.stderr?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        updateOutput?.(output);
      });

      child.on('error', (err) => {
        error = err;
      });

      child.on('close', (code, sig) => {
        signal.removeEventListener('abort', cleanup);
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
}

function getShellToolDescription(): string {
  const returnedInfo = `

The following information is returned:

Command: Executed command.
Directory: Directory (relative to project root) where command was executed, or \`(root)\`.
Output: Combined stdout and stderr output. Can be \`(empty)\` or partial on error.
Error: Error or \`(none)\` if no error was reported for the subprocess.
Exit Code: Exit code or \`(none)\` if terminated by signal.
Signal: Signal number or \`(none)\` if no signal was received.`;

  if (os.platform() === 'win32') {
    return `This tool executes a given shell command as \`cmd.exe /c <command>\`.${returnedInfo}`;
  } else {
    return `This tool executes a given shell command as \`bash -c <command>\`.${returnedInfo}`;
  }
}

function getCommandDescription(): string {
  if (os.platform() === 'win32') {
    return 'Exact command to execute as `cmd.exe /c <command>`';
  } else {
    return 'Exact bash command to execute as `bash -c <command>`';
  }
}

export class ShellTool extends BaseDeclarativeTool<ShellToolParams, ToolResult> {
  static Name: string = 'run_shell_command';

  constructor(private readonly config: ConfigManager) {
    super(
      ShellTool.Name,
      'Shell',
      getShellToolDescription(),
      Kind.Execute,
      {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: getCommandDescription(),
          },
          description: {
            type: 'string',
            description:
              'Brief description of the command for the user. Be specific and concise. Ideally a single sentence. Can be up to 3 sentences for clarity. No line breaks.',
          },
          directory: {
            type: 'string',
            description:
              '(OPTIONAL) Directory to run the command in, if not the project root directory. Must be relative to the project root directory and must already exist.',
          },
        },
        required: ['command'],
      },
      false, // output is not markdown
      true, // output can be updated
    );
  }

  protected override validateToolParamValues(
    params: ShellToolParams,
  ): string | null {
    if (!params.command.trim()) {
      return 'Command cannot be empty.';
    }

    if (params.directory) {
      if (path.isAbsolute(params.directory)) {
        return 'Directory cannot be absolute. Please use relative paths.';
      }

      const targetPath = path.resolve(this.config.getTargetDir(), params.directory);
      if (!this.config.getWorkspaceContext().isPathWithinWorkspace(targetPath)) {
        return `Directory '${params.directory}' is not within workspace.`;
      }
    }

    return null;
  }

  protected createInvocation(
    params: ShellToolParams,
  ): ToolInvocation<ShellToolParams, ToolResult> {
    return new ShellToolInvocation(this.config, params);
  }
}