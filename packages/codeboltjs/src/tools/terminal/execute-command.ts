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
import cbchat from '../../modules/chat';

/**
 * Parameters for the ExecuteCommand tool
 */
export interface ExecuteCommandToolParams {
    /**
     * One sentence explanation of why this tool is being used
     */
    explanation?: string;

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
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            // Call the SDK's terminal module
            const response = await cbterminal.executeCommand(
                this.params.command,
                this.params.return_empty_on_success ?? false
            );
            console.log("[Response from cbterminal.executeCommand]", response);

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

    private truncateOutput(output: any, maxLength: number = 200): string {
        // Ensure output is a string
        const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
        if (outputStr.length <= maxLength) return outputStr;
        return outputStr.substring(0, maxLength) + '...';
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
            'Execute Command',
            'Execute a CLI command on the system. Use this when you need to perform system operations or run specific commands to accomplish any step in the user\'s task. You must tailor your command to the user\'s system and provide a clear explanation of what the command does. Prefer to execute complex CLI commands over creating executable scripts, as they are more flexible and easier to run. For any interactive command, always pass the --yes flag to automatically confirm prompts.',
            Kind.Execute,
            {
                type: 'object',
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.Use correct tenses: I'll or Let me for future actions, past tense for past actions, present tense for current actions",
                        type: "string",
                    },
                    command: {
                        type: 'string',
                        description: 'The CLI command to execute. This should be valid for the current operating system. Ensure the command is properly formatted and does not contain any harmful instructions.'
                    }
                },
                required: ['command']
            }
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
