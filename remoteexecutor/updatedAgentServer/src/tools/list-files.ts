/**
 * List Files Tool - Lists files in a directory
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../codeboltTools/types';
import { ToolErrorType } from '../codeboltTools/types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../codeboltTools/base-tool';
import { Kind } from '../codeboltTools/types';
import type { ConfigManager } from '../codeboltTools/config';
import { executeListFiles } from '../utils/fileSystem/ListFiles';

/**
 * Parameters for the ListFiles tool
 */
export interface ListFilesToolParams {
    /**
     * The path of the directory to list contents for
     */
    path: string;

    /**
     * Whether to list files recursively
     */
    recursive?: boolean;
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
        return `Listing files in ${this.params.path}${this.params.recursive ? ' (recursively)' : ''}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Use executeListFiles utility function
            const result = await executeListFiles({
                path: this.params.path,
                recursive: this.params.recursive
            });

            if (result.error) {
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.LS_EXECUTION_ERROR,
                        message: result.error.message
                    }
                };
            }

            // Format the file list for display
            const fileList = result.files?.join('\n') || 'No files found';
            
            return {
                llmContent: fileList,
                returnDisplay: `Listed ${result.files?.length || 0} files`
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.LS_EXECUTION_ERROR,
                    message: `Failed to list files: ${errorMessage}`
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
                        type: 'boolean',
                        description: 'Whether to list files recursively'
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