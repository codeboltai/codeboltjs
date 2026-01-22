/**
 * Write File Tool - Creates or updates file content
 * Wraps the SDK's cbfs.createFile() and cbfs.updateFile() methods
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

/**
 * Parameters for the WriteFile tool
 */
export interface WriteFileToolParams {
    /**
     * The absolute path to the file to write
     */
    absolute_path: string;

    /**
     * The content to write to the file
     */
    content: string;

    /**
     * Whether to create the file if it doesn't exist (default: true)
     */
    create_if_missing?: boolean;
}

class WriteFileToolInvocation extends BaseToolInvocation<
    WriteFileToolParams,
    ToolResult
> {
    constructor(params: WriteFileToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [{ path: this.params.absolute_path }];
    }

    async execute(): Promise<ToolResult> {
        try {
            const filePath = this.params.absolute_path;
            const content = this.params.content;
            const fileName = path.basename(filePath);
            const dirPath = path.dirname(filePath);

            // Try to read the file first to check if it exists
            let fileExists = false;
            try {
                const readResult = await cbfs.readFile(filePath);
                fileExists = readResult.success === true;
            } catch {
                fileExists = false;
            }

            let response;
            if (fileExists) {
                // Update existing file
                response = await cbfs.updateFile(fileName, filePath, content);
            } else {
                // Create new file
                if (this.params.create_if_missing === false) {
                    return {
                        llmContent: `Error: File does not exist and create_if_missing is false: ${filePath}`,
                        returnDisplay: `Error: File not found`,
                        error: {
                            message: `File does not exist: ${filePath}`,
                            type: ToolErrorType.FILE_NOT_FOUND,
                        },
                    };
                }
                response = await cbfs.createFile(fileName, content, dirPath);
            }

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error writing file: ${errorMsg}`,
                    returnDisplay: `Error writing file: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.FILE_WRITE_FAILURE,
                    },
                };
            }

            const action = fileExists ? 'Updated' : 'Created';
            const lineCount = content.split('\n').length;
            const charCount = content.length;

            return {
                llmContent: `Successfully ${action.toLowerCase()} file: ${filePath}\nLines: ${lineCount}, Characters: ${charCount}`,
                returnDisplay: `${action} ${shortenPath(filePath)} (${lineCount} lines, ${charCount} chars)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error writing file: ${errorMessage}`,
                returnDisplay: `Error writing file: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the WriteFile tool logic
 */
export class WriteFileTool extends BaseDeclarativeTool<
    WriteFileToolParams,
    ToolResult
> {
    static readonly Name: string = 'write_file';

    constructor() {
        super(
            WriteFileTool.Name,
            'WriteFile',
            `Creates a new file or updates an existing file with the provided content. If the file already exists, it will be overwritten. If the file does not exist, it will be created (unless create_if_missing is false).`,
            Kind.Edit,
            {
                properties: {
                    absolute_path: {
                        description:
                            "The absolute path to the file to write (e.g., '/home/user/project/file.txt'). Relative paths are not supported.",
                        type: 'string',
                    },
                    content: {
                        description: 'The content to write to the file.',
                        type: 'string',
                    },
                    create_if_missing: {
                        description:
                            'Whether to create the file if it does not exist. Defaults to true.',
                        type: 'boolean',
                    },
                },
                required: ['absolute_path', 'content'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: WriteFileToolParams,
    ): string | null {
        const filePath = params.absolute_path;
        if (params.absolute_path.trim() === '') {
            return "The 'absolute_path' parameter must be non-empty.";
        }

        if (!path.isAbsolute(filePath)) {
            return `File path must be absolute, but was relative: ${filePath}. You must provide an absolute path.`;
        }

        if (params.content === undefined || params.content === null) {
            return "The 'content' parameter is required.";
        }

        return null;
    }

    protected createInvocation(
        params: WriteFileToolParams,
    ): ToolInvocation<WriteFileToolParams, ToolResult> {
        return new WriteFileToolInvocation(params);
    }
}
