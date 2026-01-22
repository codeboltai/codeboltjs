/**
 * Execute Command Tool - Executes shell commands
 * Wraps the SDK's cbterminal.executeCommand() method
 */

import type {
    ToolInvocation,
    ToolResult,
    ToolCallConfirmationDetails,
    ToolExecuteConfirmationDetails,
} from '../types';
import { ToolErrorType, Kind, ToolConfirmationOutcome } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbterminal from '../../modules/terminal';

/**
 * Parameters for the ExecuteCommand tool
 */
export interface ExecuteCommandToolParams {
    /**
     * The shell command to execute
     */
    command: string;

    /**
     * Whether to return empty string on success (default: false)
     */
    return_empty_on_success?: boolean;
}

class ExecuteCommandToolInvocation extends BaseToolInvocation<
    ExecuteCommandToolParams,
    ToolResult
> {
    constructor(params: ExecuteCommandToolParams) {
        super(params);
    }

    override async shouldConfirmExecute(
        _abortSignal: AbortSignal,
    ): Promise<ToolCallConfirmationDetails | false> {
        // Extract root command for confirmation
        const rootCommand = this.params.command.trim().split(/\s+/)[0];

        const confirmationDetails: ToolExecuteConfirmationDetails = {
            type: 'exec',
            title: `Execute Command: ${rootCommand}`,
            command: this.params.command,
            rootCommand: rootCommand,
            onConfirm: async (outcome: ToolConfirmationOutcome) => {
                // Callback handled by the framework
            },
        };

        return confirmationDetails;
    }

    async execute(): Promise<ToolResult> {
        try {
            // Call the SDK's terminal module
            const response = await cbterminal.executeCommand(
                this.params.command,
                this.params.return_empty_on_success ?? false
            );

            // Check for errors in response
            if (response.type === 'commandError' || (response as any).error) {
                const errorMsg = (response as any).error || (response as any).message || 'Command execution failed';
                return {
                    llmContent: `Command failed:\n${errorMsg}`,
                    returnDisplay: `Error: ${this.truncateOutput(errorMsg)}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.SHELL_EXECUTE_ERROR,
                    },
                };
            }

            // Extract output
            const output = (response as any).output || (response as any).result || (response as any).message || '';
            const exitCode = (response as any).exitCode ?? (response as any).code;

            let llmContent = '';
            if (output) {
                llmContent = `Command executed: ${this.params.command}\n\nOutput:\n${output}`;
            } else {
                llmContent = `Command executed successfully: ${this.params.command}`;
            }

            if (exitCode !== undefined && exitCode !== 0) {
                llmContent += `\n\nExit code: ${exitCode}`;
            }

            return {
                llmContent,
                returnDisplay: output ? this.truncateOutput(output) : 'Command executed successfully',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error executing command: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    private truncateOutput(output: string, maxLength: number = 200): string {
        if (output.length <= maxLength) return output;
        return output.substring(0, maxLength) + '...';
    }
}

/**
 * Implementation of the ExecuteCommand tool logic
 */
export class ExecuteCommandTool extends BaseDeclarativeTool<
    ExecuteCommandToolParams,
    ToolResult
> {
    static readonly Name: string = 'execute_command';

    constructor() {
        super(
            ExecuteCommandTool.Name,
            'ExecuteCommand',
            `Executes a shell command in the terminal. Use this to run build commands, install dependencies, run tests, or any other shell operation. The command will be executed in the project's working directory.`,
            Kind.Execute,
            {
                properties: {
                    command: {
                        description:
                            "The shell command to execute (e.g., 'npm install', 'python script.py', 'ls -la').",
                        type: 'string',
                    },
                    return_empty_on_success: {
                        description:
                            'If true, returns empty string when command succeeds. Useful for commands where output is not needed.',
                        type: 'boolean',
                    },
                },
                required: ['command'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ExecuteCommandToolParams,
    ): string | null {
        if (params.command.trim() === '') {
            return "The 'command' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: ExecuteCommandToolParams,
    ): ToolInvocation<ExecuteCommandToolParams, ToolResult> {
        return new ExecuteCommandToolInvocation(params);
    }
}
