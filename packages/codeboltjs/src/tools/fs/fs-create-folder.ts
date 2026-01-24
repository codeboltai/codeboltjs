import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { CreateFolderResponse } from '@codebolt/types/sdk';

export interface FsCreateFolderParams {
    folderName: string;
    folderPath: string;
}

class FsCreateFolderInvocation extends BaseToolInvocation<FsCreateFolderParams, ToolResult> {
    constructor(params: FsCreateFolderParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: CreateFolderResponse = await fs.createFolder(this.params.folderName, this.params.folderPath);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to create folder'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to create folder'}`,
                    error: { message: response.message || 'Failed to create folder', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Folder "${this.params.folderName}" created successfully at ${this.params.folderPath}`,
                returnDisplay: `Created folder: ${this.params.folderName}`,
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

export class FsCreateFolderTool extends BaseDeclarativeTool<FsCreateFolderParams, ToolResult> {
    constructor() {
        super('fs_create_folder', 'Create Folder', 'Create a new folder', Kind.FileSystem, {
            type: 'object',
            properties: {
                folderName: { type: 'string', description: 'Name of the folder to create' },
                folderPath: { type: 'string', description: 'Path where the folder should be created' },
            },
            required: ['folderName', 'folderPath'],
        });
    }

    protected override createInvocation(params: FsCreateFolderParams): ToolInvocation<FsCreateFolderParams, ToolResult> {
        return new FsCreateFolderInvocation(params);
    }
}
