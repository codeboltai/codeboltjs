/**
 * List Directory Tool - Lists files and directories
 * Wraps the SDK's cbfs.listDirectory() method
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
 * Parameters for the ListDirectory tool
 */
export interface ListDirectoryToolParams {
    /**
     * One sentence explanation of why this tool is being used
     */
    explanation?: string;

    /**
     * The absolute path to the directory to list
     */
    path: string;

    /**
     * Optional array of glob patterns for files/directories to ignore
     */
    ignore?: string[];

    /**
     * Whether to show hidden files and directories (default: false)
     */
    show_hidden?: boolean;

    /**
     * Whether to include detailed information (size, permissions, etc.)
     */
    detailed?: boolean;

    /**
     * Maximum number of entries to return
     */
    limit?: number;
}

class ListDirectoryToolInvocation extends BaseToolInvocation<
    ListDirectoryToolParams,
    ToolResult
> {
    constructor(params: ListDirectoryToolParams) {
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
            const response = await cbfs.listDirectory({
                path: this.params.path,
                ignore: this.params.ignore,
                show_hidden: this.params.show_hidden,
                detailed: this.params.detailed,
                limit: this.params.limit,
            });

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error listing directory: ${errorMsg}`,
                    returnDisplay: `Error listing directory: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.LS_EXECUTION_ERROR,
                    },
                };
            }

            // Format the directory listing
            const entries = response.entries || [];
            let output = `Directory: ${this.params.path}\n`;
            output += `Total entries: ${entries.length}\n\n`;

            if (entries.length === 0) {
                output += '(empty directory)';
            } else {
                // Group by type
                const dirs = entries.filter((e: any) => e.type === 'directory' || e.isDirectory);
                const files = entries.filter((e: any) => e.type === 'file' || !e.isDirectory);

                if (dirs.length > 0) {
                    output += `Directories (${dirs.length}):\n`;
                    for (const dir of dirs) {
                        const name = dir.name || dir.path || dir;
                        output += `  [DIR]  ${name}\n`;
                    }
                    output += '\n';
                }

                if (files.length > 0) {
                    output += `Files (${files.length}):\n`;
                    for (const file of files) {
                        const name = file.name || file.path || file;
                        if (this.params.detailed && file.size !== undefined) {
                            const size = this.formatSize(file.size);
                            output += `  [FILE] ${name} (${size})\n`;
                        } else {
                            output += `  [FILE] ${name}\n`;
                        }
                    }
                }
            }

            return {
                llmContent: output,
                returnDisplay: `Listed ${entries.length} entries in ${shortenPath(this.params.path)}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing directory: ${errorMessage}`,
                returnDisplay: `Error listing directory: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    private formatSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}

/**
 * Implementation of the ListDirectory tool logic
 */
export class ListDirectoryTool extends BaseDeclarativeTool<
    ListDirectoryToolParams,
    ToolResult
> {
    static readonly Name: string = 'ls';

    constructor() {
        super(
            ListDirectoryTool.Name,
            'ListDirectory',
            `Lists files and directories in a specified path. Returns information about directory contents including file names, types, and optionally sizes. Use this to explore the file system structure.`,
            Kind.Read,
            {
                properties: {
                    explanation: {
                        description:
                            "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    path: {
                        description:
                            "The absolute path to the directory to list (e.g., '/home/user/project'). Relative paths are not supported.",
                        type: 'string',
                    },
                    ignore: {
                        description:
                            "Optional array of glob patterns for files/directories to ignore (e.g., ['node_modules', '*.log']).",
                        type: 'array',
                        items: { type: 'string' },
                    },
                    show_hidden: {
                        description:
                            'Whether to show hidden files and directories (those starting with a dot). Defaults to false.',
                        type: 'boolean',
                    },
                    detailed: {
                        description:
                            'Whether to include detailed information like file sizes. Defaults to false.',
                        type: 'boolean',
                    },
                    limit: {
                        description:
                            'Maximum number of entries to return. Useful for large directories.',
                        type: 'number',
                    },
                },
                required: ['path'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ListDirectoryToolParams,
    ): string | null {
        const dirPath = params.path;
        if (params.path.trim() === '') {
            return "The 'path' parameter must be non-empty.";
        }

        if (!path.isAbsolute(dirPath)) {
            return `Path must be absolute, but was relative: ${dirPath}. You must provide an absolute path.`;
        }

        if (params.limit !== undefined && params.limit <= 0) {
            return 'Limit must be a positive number';
        }

        return null;
    }

    protected createInvocation(
        params: ListDirectoryToolParams,
    ): ToolInvocation<ListDirectoryToolParams, ToolResult> {
        return new ListDirectoryToolInvocation(params);
    }
}
