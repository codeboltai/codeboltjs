/**
 * Codemap Set Status Tool
 * 
 * Sets the status of a codemap.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodemap from '../../modules/codemap';
import type { CodemapStatus } from '../../types/codemap';

/**
 * Parameters for setting codemap status
 */
export interface CodemapSetStatusParams {
    /** The codemap ID */
    codemapId: string;
    /** The new status */
    status: CodemapStatus;
    /** Optional error message if status is 'error' */
    error?: string;
    /** Optional project path */
    projectPath?: string;
}

class CodemapSetStatusInvocation extends BaseToolInvocation<CodemapSetStatusParams, ToolResult> {
    constructor(params: CodemapSetStatusParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcodemap.setStatus(
                this.params.codemapId,
                this.params.status,
                this.params.error,
                this.params.projectPath
            );

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'SetStatus operation failed';
                return {
                    llmContent: `Error: Failed to set codemap status - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully set codemap ${this.params.codemapId} status to "${this.params.status}"`,
                returnDisplay: `Set codemap status to "${this.params.status}"`,
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
 * Tool for setting codemap status
 */
export class CodemapSetStatusTool extends BaseDeclarativeTool<CodemapSetStatusParams, ToolResult> {
    constructor() {
        super(
            'codemap_set_status',
            'Set Codemap Status',
            'Sets the status of a codemap (creating, ready, error).',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    codemapId: {
                        type: 'string',
                        description: 'The codemap ID',
                    },
                    status: {
                        type: 'string',
                        enum: ['creating', 'ready', 'error'],
                        description: 'The new status',
                    },
                    error: {
                        type: 'string',
                        description: 'Optional error message if status is "error"',
                    },
                    projectPath: {
                        type: 'string',
                        description: 'Optional project path',
                    },
                },
                required: ['codemapId', 'status'],
            }
        );
    }

    protected override createInvocation(params: CodemapSetStatusParams): ToolInvocation<CodemapSetStatusParams, ToolResult> {
        return new CodemapSetStatusInvocation(params);
    }
}
