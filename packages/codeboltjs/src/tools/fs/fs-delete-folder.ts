import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { DeleteFolderResponse } from '@codebolt/types/sdk';

export interface FsDeleteFolderParams {
    foldername: string;
    folderpath: string;
}

class FsDeleteFolderInvocation extends BaseToolInvocation<FsDeleteFolderParams, ToolResult> {
    constructor(params: FsDeleteFolderParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: DeleteFolderResponse = await fs.deleteFolder(this.params.foldername, this.params.folderpath);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to delete folder'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to delete folder'}`,
                    error: { message: response.message || 'Failed to delete folder', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Folder "${this.params.foldername}" deleted successfully`,
                returnDisplay: `Deleted folder: ${this.params.foldername}`,
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

export class FsDeleteFolderTool extends BaseDeclarativeTool<FsDeleteFolderParams, ToolResult> {
    constructor() {
        super('fs_delete_folder', 'Delete Folder', 'Delete a folder', Kind.FileSystem, {
            type: 'object',
            properties: {
                foldername: { type: 'string', description: 'Name of the folder to delete' },
                folderpath: { type: 'string', description: 'Path of the folder to delete' },
            },
            required: ['foldername', 'folderpath'],
        });
    }

    protected override createInvocation(params: FsDeleteFolderParams): ToolInvocation<FsDeleteFolderParams, ToolResult> {
        return new FsDeleteFolderInvocation(params);
    }
}
