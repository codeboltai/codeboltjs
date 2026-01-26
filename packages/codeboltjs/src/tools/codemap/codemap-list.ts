/**
 * Codemap List Tool
 * 
 * Lists all codemaps for a project.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodemap from '../../modules/codemap';

/**
 * Parameters for listing codemaps
 */
export interface CodemapListParams {
    /** Optional project path */
    projectPath?: string;
}

class CodemapListInvocation extends BaseToolInvocation<CodemapListParams, ToolResult> {
    constructor(params: CodemapListParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcodemap.list(this.params.projectPath);

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'List operation failed';
                return {
                    llmContent: `Error: Failed to list codemaps - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const codemaps = response.data?.codemaps || [];

            return {
                llmContent: `Found ${codemaps.length} codemaps`,
                returnDisplay: `Found ${codemaps.length} codemaps`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for listing codemaps
 */
export class CodemapListTool extends BaseDeclarativeTool<CodemapListParams, ToolResult> {
    constructor() {
        super(
            'codemap_list',
            'List Codemaps',
            'Lists all codemaps for a project.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    projectPath: {
                        type: 'string',
                        description: 'Optional project path',
                    },
                },
                required: [],
            }
        );
    }

    protected override createInvocation(params: CodemapListParams): ToolInvocation<CodemapListParams, ToolResult> {
        return new CodemapListInvocation(params);
    }
}
