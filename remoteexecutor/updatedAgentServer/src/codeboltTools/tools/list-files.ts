/**
 * List Files Tool - Lists files in a directory
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
 * Parameters for the ListFiles tool
 */
export interface ListFilesToolParams {
    /**
     * The directory path to list files from
     */
    path: string;

    /**
     * Whether to list files recursively
     */
    recursive?: string;
}

class ListFilesToolInvocation extends BaseToolInvocation<
    ListFilesToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: ListFilesToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        const recursive = this.params.recursive ? ' (recursive)' : '';
        return `Listing files in: ${this.params.path}${recursive}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Import DirectoryService to use new service
            const { createDirectoryService } = await import('../../services');
            
            const directoryService = createDirectoryService({
                targetDir: this.config.getTargetDir(),
                debugMode: this.config.getDebugMode(),
            });

            const isRecursive = this.params.recursive === 'true';
            const result = await directoryService.listFiles(
                this.params.path,
                isRecursive
            );

            if (result.success) {
                // Success case
                const fileList = result.files || [];
                const content = fileList.length > 0 
                    ? fileList.join('\n')
                    : 'No files found';
                
                const displayContent = `Found ${fileList.length} file(s):\n${content}`;
                
                return {
                    llmContent: content,
                    returnDisplay: displayContent
                };
            } else {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.LS_EXECUTION_ERROR,
                        message: result.error || 'Failed to list files'
                    }
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.LS_EXECUTION_ERROR,
                    message: `Failed to list files: ${error.message || error}`
                }
            };
        }
    }
}

export class ListFilesTool extends BaseDeclarativeTool<
    ListFilesToolParams,
    ToolResult
> {
    static readonly Name: string = 'list_files';

    constructor(private readonly config: ConfigManager) {
        super(
            ListFilesTool.Name,
            'List Files',
            'List files and directories within the specified directory. If recursive is true, it will list all files and directories recursively. If recursive is false or not provided, it will only list the top-level contents.',
            Kind.Search,
            {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path of the directory to list contents for'
                    },
                    recursive: {
                        type: 'string',
                        enum: ['true', 'false'],
                        description: 'Whether to list files recursively. Use \'true\' for recursive listing, \'false\' or omit for top-level only.'
                    }
                },
                required: ['path']
            }
        );
    }

    protected override validateToolParamValues(
        params: ListFilesToolParams,
    ): string | null {
        if (!params.path || params.path.trim() === '') {
            return 'Parameter "path" must be a non-empty string.';
        }
        return null;
    }

    protected createInvocation(params: ListFilesToolParams) {
        return new ListFilesToolInvocation(this.config, params);
    }
}
