/**
 * Codemap Delete Tool
 * 
 * Deletes a codemap.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodemap from '../../modules/codemap';

/**
 * Parameters for deleting a codemap
 */
export interface CodemapDeleteParams {
    /** The codemap ID */
    codemapId: string;
    /** Optional project path */
    projectPath?: string;
}

class CodemapDeleteInvocation extends BaseToolInvocation<CodemapDeleteParams, ToolResult> {
    constructor(params: CodemapDeleteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcodemap.delete(this.params.codemapId, this.params.projectPath);

            if (!response.payload?.success) {
                return {
                    llmContent: 'Error: Failed to delete codemap',
                    returnDisplay: 'Error: Failed to delete codemap',
                    error: {
                        message: 'Delete operation failed',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted codemap ${this.params.codemapId}`,
                returnDisplay: `Deleted codemap ${this.params.codemapId}`,
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
 * Tool for deleting a codemap
 */
export class CodemapDeleteTool extends BaseDeclarativeTool<CodemapDeleteParams, ToolResult> {
    constructor() {
        super(
            'codemap_delete',
            'Delete Codemap',
            'Deletes a codemap.',
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

    protected override createInvocation(params: CodemapDeleteParams): ToolInvocation<CodemapDeleteParams, ToolResult> {
        return new CodemapDeleteInvocation(params);
    }
}
