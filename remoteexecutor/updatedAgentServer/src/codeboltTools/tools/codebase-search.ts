/**
 * Codebase Search Tool - Searches through the codebase
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
 * Parameters for the CodebaseSearch tool
 */
export interface CodebaseSearchToolParams {
    /**
     * The search query
     */
    query: string;

    /**
     * Target directories to search in (optional)
     */
    target_directories?: string[];
}

class CodebaseSearchToolInvocation extends BaseToolInvocation<
    CodebaseSearchToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: CodebaseSearchToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        const dirs = this.params.target_directories
            ? ` in ${this.params.target_directories.join(', ')}`
            : '';
        return `Searching codebase for: ${this.params.query}${dirs}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Import handleCodebaseSearchTool to use existing logic
            const { handleCodebaseSearchTool } = await import('../../cliLib/mcpService.cli');

            // Create finalMessage object similar to mcpService.cli.ts
            const finalMessage = {
                threadId: 'codebolt-tools',
                agentInstanceId: 'codebolt-tools',
                agentId: 'codebolt-tools',
                parentAgentInstanceId: 'codebolt-tools',
                parentId: 'codebolt-tools'
            };

            // Use the exact same logic as mcpService.cli.ts
            const result = await handleCodebaseSearchTool(this.params, finalMessage);

            if (result && result[0] === false) {
                // Success case
                return {
                    llmContent: result[1] || 'Codebase search completed',
                    returnDisplay: result[1] || 'Codebase search completed'
                };
            } else if (result && typeof result === 'string') {
                // Direct result case
                return {
                    llmContent: result,
                    returnDisplay: result
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.EXECUTION_FAILED,
                        message: (result && result[1]) || 'Codebase search failed'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: `Failed to search codebase: ${error.message || error}`
                }
            };
        }
    }
}

export class CodebaseSearchTool extends BaseDeclarativeTool<
    CodebaseSearchToolParams,
    ToolResult
> {
    static readonly Name: string = 'codebase_search';

    constructor(private readonly config: ConfigManager) {
        super(
            CodebaseSearchTool.Name,
            'Codebase Search',
            'Find snippets of code from the codebase most relevant to the search query. This is a semantic search tool, so the query should ask for something semantically matching what is needed. Use this to discover code patterns, understand implementations, or find specific functionality across the codebase.',
            Kind.Search,
            {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query to find relevant code. Be specific about what you\'re looking for.'
                    },
                    target_directories: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: 'Optional array of directory paths to limit the search scope. If not provided, the entire codebase will be searched.'
                    }
                },
                required: ['query']
            }
        );
    }

    protected override validateToolParamValues(
        params: CodebaseSearchToolParams,
    ): string | null {
        if (!params.query || params.query.trim() === '') {
            return 'Parameter "query" must be a non-empty string.';
        }
        return null;
    }

    protected createInvocation(params: CodebaseSearchToolParams) {
        return new CodebaseSearchToolInvocation(this.config, params);
    }
}
