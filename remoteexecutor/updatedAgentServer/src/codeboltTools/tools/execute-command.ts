/**
 * Execute Command Tool - Executes shell commands
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import type { ConfigManager } from '../config';

/**
 * Parameters for the ExecuteCommand tool
 */
export interface ExecuteCommandToolParams {
    /**
     * The shell command to execute
     */
    command: string;
}

class ExecuteCommandToolInvocation extends BaseToolInvocation<
    ExecuteCommandToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: ExecuteCommandToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        return `Executing command: ${this.params.command}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Import terminalCliService to use existing logic
            const { terminalCliService } = await import('../../cliLib/terminalService.cli');

            // Create finalMessage object similar to mcpService.cli.ts
            const finalMessage = {
                command: this.params.command,
                // Add other required properties that might be needed
                threadId: 'codebolt-tools',
                agentInstanceId: 'codebolt-tools',
                agentId: 'codebolt-tools',
                parentAgentInstanceId: 'codebolt-tools',
                parentId: 'codebolt-tools'
            };

            // Use the exact same logic as mcpService.cli.ts
            const result = await terminalCliService.executeCommand(finalMessage);

            if (result && result[0] === false) {
                // Success case
                return {
                    llmContent: result[1] || 'Command executed successfully',
                    returnDisplay: result[1] || 'Command executed successfully'
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.SHELL_EXECUTE_ERROR,
                        message: result[1] || 'Command execution failed'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.SHELL_EXECUTE_ERROR,
                    message: `Failed to execute command: ${error.message || error}`
                }
            };
        }
    }
}

export class ExecuteCommandTool extends BaseDeclarativeTool<
    ExecuteCommandToolParams,
    ToolResult
> {
    static readonly Name: string = 'execute_command';

    constructor(private readonly config: ConfigManager) {
        super(
            ExecuteCommandTool.Name,
            'Execute Command',
            'Execute a CLI command on the system. Use this when you need to perform system operations or run specific commands to accomplish any step in the user\'s task. You must tailor your command to the user\'s system and provide a clear explanation of what the command does. Prefer to execute complex CLI commands over creating executable scripts, as they are more flexible and easier to run. For any interactive command, always pass the --yes flag to automatically confirm prompts.',
            Kind.Execute,
            {
                type: 'object',
                properties: {
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
        if (!params.command || params.command.trim() === '') {
            return 'Parameter "command" must be a non-empty string.';
        }
        return null;
    }

    protected createInvocation(params: ExecuteCommandToolParams) {
        return new ExecuteCommandToolInvocation(this.config, params);
    }
}
