import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { DeleteFileResponse } from '@codebolt/types/sdk';

export interface FsDeleteFileParams {
    filename: string;
    filePath: string;
}

class FsDeleteFileInvocation extends BaseToolInvocation<FsDeleteFileParams, ToolResult> {
    constructor(params: FsDeleteFileParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: DeleteFileResponse = await fs.deleteFile(this.params.filename, this.params.filePath);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to delete file'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to delete file'}`,
                    error: { message: response.message || 'Failed to delete file', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `File "${this.params.filename}" deleted successfully`,
                returnDisplay: `Deleted file: ${this.params.filename}`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class FsDeleteFileTool extends BaseDeclarativeTool<FsDeleteFileParams, ToolResult> {
    constructor() {
        super('fs_delete_file', 'Delete File', 'Delete a file', Kind.FileSystem, {
            type: 'object',
            properties: {
                filename: { type: 'string', description: 'Name of the file to delete' },
                filePath: { type: 'string', description: 'Path of the file to delete' },
            },
            required: ['filename', 'filePath'],
        });
    }

    protected override createInvocation(params: FsDeleteFileParams): ToolInvocation<FsDeleteFileParams, ToolResult> {
        return new FsDeleteFileInvocation(params);
    }
}
