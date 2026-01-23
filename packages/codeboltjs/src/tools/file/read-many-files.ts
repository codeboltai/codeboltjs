/**
 * Read Many Files Tool - Reads multiple files at once
 * Wraps the SDK's cbfs.readManyFiles() method
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

/**
 * Parameters for the ReadManyFiles tool
 */
export interface ReadManyFilesToolParams {
    /**
     * An array of file paths, directory paths, or glob patterns to read
     */
    paths: string[];

    /**
     * Optional glob patterns for files to include
     */
    include?: string[];

    /**
     * Optional glob patterns for files/directories to exclude
     */
    exclude?: string[];

    /**
     * Whether to search recursively through subdirectories (default: true)
     */
    recursive?: boolean;

    /**
     * Whether to use default exclusion patterns (node_modules, .git, etc.)
     */
    use_default_excludes?: boolean;

    /**
     * Maximum number of files to read
     */
    max_files?: number;

    /**
     * Maximum total size of content to read (in bytes)
     */
    max_total_size?: number;

    /**
     * Whether to include file metadata in output
     */
    include_metadata?: boolean;
}

class ReadManyFilesToolInvocation extends BaseToolInvocation<
    ReadManyFilesToolParams,
    ToolResult
> {
    constructor(params: ReadManyFilesToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return this.params.paths.map(p => ({ path: p }));
    }

    async execute(): Promise<ToolResult> {
        try {
            // Call the SDK's fs module
            const response = await cbfs.readManyFiles({
                paths: this.params.paths,
                include: this.params.include,
                exclude: this.params.exclude,
                recursive: this.params.recursive ?? true,
                use_default_excludes: this.params.use_default_excludes ?? true,
                max_files: this.params.max_files,
                max_total_size: this.params.max_total_size,
                include_metadata: this.params.include_metadata,
            });

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error reading files: ${errorMsg}`,
                    returnDisplay: `Error reading files: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.READ_MANY_FILES_SEARCH_ERROR,
                    },
                };
            }

            // Format the output
            // ReadManyFilesResponse has results?: { path, content, ... }[], summary?: { total, successful, failed }
            const results = response.results || [];
            const summary = response.summary || { total: results.length, successful: 0, failed: 0 };
            const filesRead = summary.successful;
            const totalSize = results.reduce((sum, r) => sum + (r.content?.length || 0), 0);

            // isTruncated moved/removed? checking BaseFsSDKResponse extensions or implementation details.
            // In updated types, isTruncated was removed from top level OR moved to summary?
            // Checking fs.ts update: ReadManyFilesResponse has results and summary.
            // isTruncated is NOT explicitly there anymore unless in base/extended.
            // Let's rely on results content.
            const truncated = false; // Placeholder if no longer in response

            let output = '';

            if (results.length === 0) {
                output = 'No files matched the specified patterns.';
            } else {
                // Add summary header
                output += `=== Read ${filesRead} file(s) (Total found: ${summary.total}) ===\n`;
                output += '\n';

                // Add each file's content
                for (const result of results) {
                    const filePath = result.path;
                    // If error exists, it might be in result.error
                    if (result.error) {
                        output += `--- FILE: ${filePath} (ERROR) ---\n`;
                        output += `Error: ${JSON.stringify(result.error)}\n\n`;
                        continue;
                    }

                    const content = result.content || '';

                    output += `--- FILE: ${filePath} ---\n`;
                    if (this.params.include_metadata && result.stats) {
                        output += `Size: ${result.stats.size} bytes\n`;
                    }
                    output += content;
                    if (!content.endsWith('\n')) {
                        output += '\n';
                    }
                    output += '\n';
                }
            }

            return {
                llmContent: output,
                returnDisplay: `Read ${filesRead}/${summary.total} file(s), ${this.formatSize(totalSize)} total`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error reading files: ${errorMessage}`,
                returnDisplay: `Error reading files: ${errorMessage}`,
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
 * Implementation of the ReadManyFiles tool logic
 */
export class ReadManyFilesTool extends BaseDeclarativeTool<
    ReadManyFilesToolParams,
    ToolResult
> {
    static readonly Name: string = 'read_many_files';

    constructor() {
        super(
            ReadManyFilesTool.Name,
            'ReadManyFiles',
            `Reads multiple files at once based on file paths, directory paths, or glob patterns. Efficiently retrieves content from multiple files in a single operation. Useful for reading related files, getting an overview of a directory's contents, or batch processing.`,
            Kind.Read,
            {
                properties: {
                    paths: {
                        description:
                            "An array of file paths, directory paths, or glob patterns to read (e.g., ['/path/to/file.ts', '/path/to/dir', '**/*.json']).",
                        type: 'array',
                        items: { type: 'string' },
                    },
                    include: {
                        description:
                            "Optional glob patterns for files to include (e.g., ['*.ts', '*.tsx']).",
                        type: 'array',
                        items: { type: 'string' },
                    },
                    exclude: {
                        description:
                            "Optional glob patterns for files/directories to exclude (e.g., ['*.test.ts', 'node_modules']).",
                        type: 'array',
                        items: { type: 'string' },
                    },
                    recursive: {
                        description:
                            'Whether to search recursively through subdirectories. Defaults to true.',
                        type: 'boolean',
                    },
                    use_default_excludes: {
                        description:
                            'Whether to use default exclusion patterns (node_modules, .git, etc.). Defaults to true.',
                        type: 'boolean',
                    },
                    max_files: {
                        description:
                            'Maximum number of files to read. Useful for limiting output size.',
                        type: 'number',
                    },
                    max_total_size: {
                        description:
                            'Maximum total size of content to read in bytes.',
                        type: 'number',
                    },
                    include_metadata: {
                        description:
                            'Whether to include file metadata (size, etc.) in output.',
                        type: 'boolean',
                    },
                },
                required: ['paths'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ReadManyFilesToolParams,
    ): string | null {
        if (!params.paths || params.paths.length === 0) {
            return "The 'paths' parameter must be a non-empty array.";
        }

        if (params.max_files !== undefined && params.max_files <= 0) {
            return 'max_files must be a positive number';
        }

        if (params.max_total_size !== undefined && params.max_total_size <= 0) {
            return 'max_total_size must be a positive number';
        }

        return null;
    }

    protected createInvocation(
        params: ReadManyFilesToolParams,
    ): ToolInvocation<ReadManyFilesToolParams, ToolResult> {
        return new ReadManyFilesToolInvocation(params);
    }
}
