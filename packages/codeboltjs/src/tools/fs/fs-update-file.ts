import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { UpdateFileResponse } from '@codebolt/types/sdk';

export interface FsUpdateFileParams {
    filename: string;
    filePath: string;
    newContent: string;
}

class FsUpdateFileInvocation extends BaseToolInvocation<FsUpdateFileParams, ToolResult> {
    constructor(params: FsUpdateFileParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: UpdateFileResponse = await fs.updateFile(this.params.filename, this.params.filePath, this.params.newContent);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to update file'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to update file'}`,
                    error: { message: response.message || 'Failed to update file', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `File "${this.params.filename}" updated successfully`,
                returnDisplay: `Updated file: ${this.params.filename}`,
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

export class FsUpdateFileTool extends BaseDeclarativeTool<FsUpdateFileParams, ToolResult> {
    constructor() {
        super('fs_update_file', 'Update File', 'Update the content of a file', Kind.FileSystem, {
            type: 'object',
            properties: {
                filename: { type: 'string', description: 'Name of the file to update' },
                filePath: { type: 'string', description: 'Path of the file to update' },
                newContent: { type: 'string', description: 'New content to write into the file' },
            },
            required: ['filename', 'filePath', 'newContent'],
        });
    }

    protected override createInvocation(params: FsUpdateFileParams): ToolInvocation<FsUpdateFileParams, ToolResult> {
        return new FsUpdateFileInvocation(params);
    }
}
