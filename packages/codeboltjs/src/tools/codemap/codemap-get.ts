/**
 * Codemap Get Tool
 * 
 * Retrieves a specific codemap by ID.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodemap from '../../modules/codemap';

/**
 * Parameters for getting a codemap
 */
export interface CodemapGetParams {
    /** The codemap ID */
    codemapId: string;
    /** Optional project path */
    projectPath?: string;
}

class CodemapGetInvocation extends BaseToolInvocation<CodemapGetParams, ToolResult> {
    constructor(params: CodemapGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcodemap.get(this.params.codemapId, this.params.projectPath);

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Get operation failed';
                return {
                    llmContent: `Error: Failed to get codemap - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const codemap = response.data?.codemap;

            return {
                llmContent: `Retrieved codemap ${this.params.codemapId}: ${codemap?.title || 'Untitled'}`,
                returnDisplay: `Retrieved codemap ${this.params.codemapId}`,
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
 * Tool for getting a codemap
 */
export class CodemapGetTool extends BaseDeclarativeTool<CodemapGetParams, ToolResult> {
    constructor() {
        super(
            'codemap_get',
            'Get Codemap',
            'Retrieves a specific codemap by ID.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    codemapId: {
                        type: 'string',
                        description: 'The codemap ID',
                    },
                    projectPath: {
                        type: 'string',
                        description: 'Optional project path',
                    },
                },
                required: ['codemapId'],
            }
        );
    }

    protected override createInvocation(params: CodemapGetParams): ToolInvocation<CodemapGetParams, ToolResult> {
        return new CodemapGetInvocation(params);
    }
}
