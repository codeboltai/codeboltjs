/**
 * Grep Tool - Searches for text patterns in files
 * Wraps the SDK's cbfs.grepSearch() method
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
 * Parameters for the Grep tool
 */
export interface GrepToolParams {
    /**
     * One sentence explanation of why this tool is being used
     */
    explanation?: string;

    /**
     * The path to search within (file or directory)
     */
    path: string;

    /**
     * The text pattern or regex to search for
     */
    pattern: string;

    /**
     * Glob pattern for files to include (e.g., "*.ts", "*.{js,jsx}")
     */
    include?: string;

    /**
     * Glob pattern for files to exclude
     */
    exclude?: string;

    /**
     * Whether the search is case sensitive (default: true)
     */
    case_sensitive?: boolean;
}

class GrepToolInvocation extends BaseToolInvocation<
    GrepToolParams,
    ToolResult
> {
    constructor(params: GrepToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [{ path: this.params.path }];
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            // Call the SDK's fs module
            const response = await cbfs.grepSearch(
                this.params.path,
                this.params.pattern,
                this.params.include,
                this.params.exclude,
                this.params.case_sensitive ?? true
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error searching files: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.GREP_EXECUTION_ERROR,
                    },
                };
            }

            // Format the search results
            // GrepSearchResponse has results?: Array<{path, matches: {line, content...}, stats?}>
            const results = response.results || [];

            if (results.length === 0) {
                return {
                    llmContent: `No matches found for pattern: "${this.params.pattern}"`,
                    returnDisplay: `No matches found`,
                };
            }

            // Results are already grouped by file in the new structure (Array of {path, matches})
            // So we don't need to manually map.

            let totalMatches = 0;
            let output = '';

            // Build output from structured results
            for (const result of results) {
                const filePath = result.path;
                const matches = result.matches || [];
                totalMatches += matches.length;

                output += `--- ${filePath} ---\n`;
                for (const m of matches) {
                    output += `${m.line}: ${m.content}\n`;
                }
                output += '\n';
            }

            // Prepend header
            output = `Found ${totalMatches} match(es) in ${results.length} file(s) for pattern: "${this.params.pattern}"\n\n` + output;

            return {
                llmContent: output,
                returnDisplay: `Found ${totalMatches} match(es) in ${results.length} file(s)`,
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
 * Implementation of the Grep tool logic
 */
export class GrepTool extends BaseDeclarativeTool<
    GrepToolParams,
    ToolResult
> {
    static readonly Name: string = 'grep';

    constructor() {
        super(
            GrepTool.Name,
            'Grep',
            `Searches for text patterns in files using grep-like functionality. Supports regex patterns and can filter by file types. Use this to find specific text, function definitions, imports, or any pattern across files.`,
            Kind.Search,
            {
                properties: {
                    explanation: {
                        description:
                            "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    path: {
                        description:
                            "The absolute path to search within. Can be a file or directory.",
                        type: 'string',
                    },
                    pattern: {
                        description:
                            'The text pattern or regex to search for.',
                        type: 'string',
                    },
                    include: {
                        description:
                            "Glob pattern for files to include (e.g., '*.ts', '*.{js,jsx,ts,tsx}').",
                        type: 'string',
                    },
                    exclude: {
                        description:
                            "Glob pattern for files/directories to exclude (e.g., 'node_modules/**').",
                        type: 'string',
                    },
                    case_sensitive: {
                        description:
                            'Whether the search is case sensitive. Defaults to true.',
                        type: 'boolean',
                    },
                },
                required: ['path', 'pattern'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: GrepToolParams,
    ): string | null {
        if (params.path.trim() === '') {
            return "The 'path' parameter must be non-empty.";
        }

        if (!path.isAbsolute(params.path)) {
            return `Path must be absolute, but was relative: ${params.path}.`;
        }

        if (params.pattern.trim() === '') {
            return "The 'pattern' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: GrepToolParams,
    ): ToolInvocation<GrepToolParams, ToolResult> {
        return new GrepToolInvocation(params);
    }
}
