import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { CreateFileResponse } from '@codebolt/types/sdk';

export interface FsCreateFileParams {
    fileName: string;
    source: string;
    filePath: string;
}

class FsCreateFileInvocation extends BaseToolInvocation<FsCreateFileParams, ToolResult> {
    constructor(params: FsCreateFileParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: CreateFileResponse = await fs.createFile(this.params.fileName, this.params.source, this.params.filePath);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to create file'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to create file'}`,
                    error: { message: response.message || 'Failed to create file', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `File "${this.params.fileName}" created successfully at ${this.params.filePath}`,
                returnDisplay: `Created file: ${this.params.fileName}`,
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

export class FsCreateFileTool extends BaseDeclarativeTool<FsCreateFileParams, ToolResult> {
    constructor() {
        super('fs_create_file', 'Create File', 'Create a new file', Kind.FileSystem, {
            type: 'object',
            properties: {
                fileName: { type: 'string', description: 'Name of the file to create' },
                source: { type: 'string', description: 'Content to write into the file' },
                filePath: { type: 'string', description: 'Path where the file should be created' },
            },
            required: ['fileName', 'source', 'filePath'],
        });
    }

    protected override createInvocation(params: FsCreateFileParams): ToolInvocation<FsCreateFileParams, ToolResult> {
        return new FsCreateFileInvocation(params);
    }
}
