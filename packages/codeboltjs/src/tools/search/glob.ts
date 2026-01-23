/**
 * Glob Tool - Finds files matching glob patterns
 * Wraps the SDK's cbfs.searchFiles() and cbfs.fileSearch() methods
 */

import * as path from 'path';
import type {
    ToolInvocation,
    ToolLocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbfs from '../../modules/fs';
import cbchat from '../../modules/chat';

/**
 * Parameters for the Glob tool
 */
export interface GlobToolParams {
    /**
     * One sentence explanation of why this tool is being used
     */
    explanation?: string;

    /**
     * The glob pattern to match files (e.g., "**\/*.ts", "src/**\/*.js")
     */
    pattern: string;

    /**
     * The directory to search in (optional, defaults to project root)
     */
    path?: string;
}

class GlobToolInvocation extends BaseToolInvocation<
    GlobToolParams,
    ToolResult
> {
    constructor(params: GlobToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        if (this.params.path) {
            return [{ path: this.params.path }];
        }
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            // Use fileSearch for fuzzy/glob pattern matching
            const response = await cbfs.fileSearch(this.params.pattern);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error searching files: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GLOB_EXECUTION_ERROR,
                    },
                };
            }

            // Format the results - FileSearchResponse has results?: string[]
            const files = response.results || [];

            if (files.length === 0) {
                return {
                    llmContent: `No files found matching pattern: "${this.params.pattern}"`,
                    returnDisplay: `No files found`,
                };
            }

            let output = `Found ${files.length} file(s) matching pattern: "${this.params.pattern}"\n\n`;

            for (const file of files) {
                output += `${file}\n`;
            }

            return {
                llmContent: output,
                returnDisplay: `Found ${files.length} file(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error searching files: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the Glob tool logic
 */
export class GlobTool extends BaseDeclarativeTool<
    GlobToolParams,
    ToolResult
> {
    static readonly Name: string = 'glob';

    constructor() {
        super(
            GlobTool.Name,
            'Glob',
            `Finds files matching a glob pattern. Use this to locate files by name pattern, extension, or path structure. Supports standard glob syntax like *, **, and {a,b} alternatives.`,
            Kind.Search,
            {
                properties: {
                    explanation: {
                        description:
                            "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    pattern: {
                        description:
                            "The glob pattern to match files (e.g., '**/*.ts', 'src/**/*.{js,jsx}', '**/test/*.spec.ts').",
                        type: 'string',
                    },
                    path: {
                        description:
                            'Optional: The directory to search in. If not specified, searches from the project root.',
                        type: 'string',
                    },
                },
                required: ['pattern'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: GlobToolParams,
    ): string | null {
        if (params.pattern.trim() === '') {
            return "The 'pattern' parameter must be non-empty.";
        }

        if (params.path !== undefined && params.path.trim() !== '' && !path.isAbsolute(params.path)) {
            return `Path must be absolute, but was relative: ${params.path}.`;
        }

        return null;
    }

    protected createInvocation(
        params: GlobToolParams,
    ): ToolInvocation<GlobToolParams, ToolResult> {
        return new GlobToolInvocation(params);
    }
}
