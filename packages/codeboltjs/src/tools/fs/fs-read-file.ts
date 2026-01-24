import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { ReadFileResponse } from '@codebolt/types/sdk';

export interface FsReadFileParams {
    filePath: string;
}

class FsReadFileInvocation extends BaseToolInvocation<FsReadFileParams, ToolResult> {
    constructor(params: FsReadFileParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: ReadFileResponse = await fs.readFile(this.params.filePath);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to read file'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to read file'}`,
                    error: { message: response.message || 'Failed to read file', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `File read successfully`,
                returnDisplay: response.result?.content || '',
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

export class FsReadFileTool extends BaseDeclarativeTool<FsReadFileParams, ToolResult> {
    constructor() {
        super('fs_read_file', 'Read File', 'Read the content of a file', Kind.FileSystem, {
            type: 'object',
            properties: {
                filePath: { type: 'string', description: 'Path of the file to read' },
            },
            required: ['filePath'],
        });
    }

    protected override createInvocation(params: FsReadFileParams): ToolInvocation<FsReadFileParams, ToolResult> {
        return new FsReadFileInvocation(params);
    }
}
