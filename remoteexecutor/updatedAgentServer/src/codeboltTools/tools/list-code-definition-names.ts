/**
 * List Code Definition Names Tool - Lists code definitions from files
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
 * Parameters for the ListCodeDefinitionNames tool
 */
export interface ListCodeDefinitionNamesToolParams {
    /**
     * The path to analyze for code definitions
     */
    path: string;
}

class ListCodeDefinitionNamesToolInvocation extends BaseToolInvocation<
    ListCodeDefinitionNamesToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: ListCodeDefinitionNamesToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        return `Listing code definitions in: ${this.params.path}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Import fsService to use existing logic
            const { fsService } = await import('../../cliLib/fsService.cli');

            // Create finalMessage object similar to mcpService.cli.ts
            const finalMessage = {
                threadId: 'codebolt-tools',
                agentInstanceId: 'codebolt-tools',
                agentId: 'codebolt-tools',
                parentAgentInstanceId: 'codebolt-tools',
                parentId: 'codebolt-tools'
            };

            // Use the exact same logic as fsService
            const result = await fsService.listCodeDefinitionNames(this.params.path, finalMessage);

            if (result && result[0] === false) {
                // Success case
                return {
                    llmContent: result[1] || 'Code definitions listed successfully',
                    returnDisplay: result[1] || 'Code definitions listed successfully'
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.EXECUTION_FAILED,
                        message: result[1] || 'Failed to list code definitions'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: `Failed to list code definitions: ${error.message || error}`
                }
            };
        }
    }
}

export class ListCodeDefinitionNamesTool extends BaseDeclarativeTool<
    ListCodeDefinitionNamesToolParams,
    ToolResult
> {
    static readonly Name: string = 'list_code_definition_names';

    constructor(private readonly config: ConfigManager) {
        super(
            ListCodeDefinitionNamesTool.Name,
            'List Code Definition Names',
            'Lists definition names (classes, functions, methods, etc.) used in source code files at the top level of the specified directory. This tool provides insights into the codebase structure and important constructs, encapsulating high-level concepts and relationships that are crucial for understanding the overall architecture.',
            Kind.Search,
            {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path of the directory to list top level source code definitions for'
                    }
                },
                required: ['path']
            }
        );
    }

    protected override validateToolParamValues(
        params: ListCodeDefinitionNamesToolParams,
    ): string | null {
        if (!params.path || params.path.trim() === '') {
            return 'Parameter "path" must be a non-empty string.';
        }
        return null;
    }

    protected createInvocation(params: ListCodeDefinitionNamesToolParams) {
        return new ListCodeDefinitionNamesToolInvocation(this.config, params);
    }
}
