import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fs from '../../modules/fs';
import type { ListCodeDefinitionsResponse } from '@codebolt/types/sdk';

export interface FsListCodeDefinitionsParams {
    path: string;
}

class FsListCodeDefinitionsInvocation extends BaseToolInvocation<FsListCodeDefinitionsParams, ToolResult> {
    constructor(params: FsListCodeDefinitionsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: ListCodeDefinitionsResponse = await fs.listCodeDefinitionNames(this.params.path);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.message || 'Failed to list code definitions'}`,
                    returnDisplay: `Error: ${response.message || 'Failed to list code definitions'}`,
                    error: { message: response.message || 'Failed to list code definitions', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const definitions = response.result?.definitions || [];
            return {
                llmContent: `Found ${definitions.length} code definition(s) in ${this.params.path}`,
                returnDisplay: JSON.stringify(definitions, null, 2),
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

export class FsListCodeDefinitionsTool extends BaseDeclarativeTool<FsListCodeDefinitionsParams, ToolResult> {
    constructor() {
        super('fs_list_code_definitions', 'List Code Definitions', 'List all code definition names in a given path', Kind.FileSystem, {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Path to search for code definitions' },
            },
            required: ['path'],
        });
    }

    protected override createInvocation(params: FsListCodeDefinitionsParams): ToolInvocation<FsListCodeDefinitionsParams, ToolResult> {
        return new FsListCodeDefinitionsInvocation(params);
    }
}
