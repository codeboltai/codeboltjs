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
            // Import TerminalService to use new service
            const { createTerminalService } = await import('../../services');
            
            const terminalService = createTerminalService({
                targetDir: this.config.getTargetDir(),
                debugMode: this.config.getDebugMode(),
            });

            const result = await terminalService.executeCommand(this.params.command, {
                updateOutput,
            });

            if (result.error || (result.exitCode !== null && result.exitCode !== 0)) {
                // Error case
                const errorMessage = result.error?.message || 
                    (result.exitCode !== null ? `Command exited with code ${result.exitCode}` : 'Unknown error');
                return {
                    llmContent: `Command failed: ${errorMessage}\nOutput: ${result.output}`,
                    returnDisplay: `Error: ${errorMessage}`,
                    error: {
                        type: ToolErrorType.SHELL_EXECUTE_ERROR,
                        message: errorMessage
                    }
                };
            } else {
                // Success case
                return {
                    llmContent: result.output || 'Command executed successfully',
                    returnDisplay: result.output || 'Command executed successfully'
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
