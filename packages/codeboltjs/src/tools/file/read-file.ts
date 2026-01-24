/**
 * Read File Tool - Reads and returns the content of a specified file
 * Wraps the SDK's cbfs.readFile() method
 */

import * as path from 'path';
import { shortenPath } from '../utils/paths';
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
 * Parameters for the ReadFile tool
 */
export interface ReadFileToolParams {
    /**
     * One sentence explanation of why this tool is being used
     */
    explanation?: string;

    /**
     * The absolute path to the file to read
     */
    absolute_path: string;

    /**
     * The line number to start reading from (optional, 0-based)
     */
    offset?: number;

    /**
     * The number of lines to read (optional)
     */
    limit?: number;
}

class ReadFileToolInvocation extends BaseToolInvocation<
    ReadFileToolParams,
    ToolResult
> {
    constructor(params: ReadFileToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        const location: ToolLocation = { path: this.params.absolute_path };
        if (this.params.offset !== undefined) {
            location.line = this.params.offset;
        }
        return [location];
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            // Call the SDK's fs module
            const response = await cbfs.readFile(this.params.absolute_path);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error reading file: ${errorMsg}`,
                    returnDisplay: `Error reading file: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.FILE_NOT_FOUND,
                    },
                };
            }

            let content = response.content || '';
            let isTruncated = false;
            let linesShown: [number, number] | undefined;
            let originalLineCount: number | undefined;

            // Apply offset/limit if specified (presentation logic)
            if (this.params.offset !== undefined || this.params.limit !== undefined) {
                const lines = content.split('\n');
                originalLineCount = lines.length;

                const startLine = this.params.offset || 0;
                const endLine = this.params.limit
                    ? Math.min(startLine + this.params.limit, lines.length)
                    : lines.length;

                if (startLine >= lines.length) {
                    return {
                        llmContent: `Error: Offset ${startLine} is beyond the file length (${lines.length} lines)`,
                        returnDisplay: `Error: Offset out of range`,
                        error: {
                            message: `Offset ${startLine} is beyond file length`,
                            type: ToolErrorType.INVALID_TOOL_PARAMS,
                        },
                    };
                }

                const selectedLines = lines.slice(startLine, endLine);
                content = selectedLines.join('\n');
                linesShown = [startLine + 1, endLine]; // 1-based for display
                isTruncated = endLine < lines.length;
            }

            // Build response content with truncation messaging
            let llmContent: string;
            if (isTruncated && linesShown && originalLineCount) {
                const [start, end] = linesShown;
                const nextOffset = this.params.offset
                    ? this.params.offset + end - start + 1
                    : end;
                llmContent = `
IMPORTANT: The file content has been truncated.
Status: Showing lines ${start}-${end} of ${originalLineCount} total lines.
Action: To read more of the file, you can use the 'offset' and 'limit' parameters in a subsequent 'read_file' call. For example, to read the next section of the file, use offset: ${nextOffset}.

--- FILE CONTENT (truncated) ---
${content}`;
            } else {
                llmContent = content;
            }

            return {
                llmContent,
                returnDisplay: `Successfully read ${shortenPath(this.params.absolute_path)}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error reading file: ${errorMessage}`,
                returnDisplay: `Error reading file: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ReadFile tool logic
 */
export class ReadFileTool extends BaseDeclarativeTool<
    ReadFileToolParams,
    ToolResult
> {
    static readonly Name: string = 'read_file';

    constructor() {
        super(
            ReadFileTool.Name,
            'ReadFile',
            `Reads and returns the content of a specified file. If the file is large, the content will be truncated. The tool's response will clearly indicate if truncation has occurred and will provide details on how to read more of the file using the 'offset' and 'limit' parameters. Handles text files and can read specific line ranges.`,
            Kind.Read,
            {
                properties: {
                    explanation: {
                        description:
                            "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    absolute_path: {
                        description:
                            "The absolute path to the file to read (e.g., '/home/user/project/file.txt'). Relative paths are not supported. You must provide an absolute path.",
                        type: 'string',
                    },
                    offset: {
                        description:
                            "Optional: For text files, the 0-based line number to start reading from. Requires 'limit' to be set. Use for paginating through large files.",
                        type: 'number',
                    },
                    limit: {
                        description:
                            "Optional: For text files, maximum number of lines to read. Use with 'offset' to paginate through large files. If omitted, reads the entire file (if feasible, up to a default limit).",
                        type: 'number',
                    },
                },
                required: ['absolute_path'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReadFileToolParams,
    ): string | null {
        const filePath = params.absolute_path;
        if (params.absolute_path.trim() === '') {
            return "The 'absolute_path' parameter must be non-empty.";
        }

        if (!path.isAbsolute(filePath)) {
            return `File path must be absolute, but was relative: ${filePath}. You must provide an absolute path.`;
        }

        if (params.offset !== undefined && params.offset < 0) {
            return 'Offset must be a non-negative number';
        }

        if (params.limit !== undefined && params.limit <= 0) {
            return 'Limit must be a positive number';
        }

        return null;
    }

    protected createInvocation(
        params: ReadFileToolParams,
    ): ToolInvocation<ReadFileToolParams, ToolResult> {
        return new ReadFileToolInvocation(params);
    }
}
