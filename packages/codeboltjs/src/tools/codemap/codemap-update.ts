/**
 * Codemap Update Tool
 * 
 * Updates codemap info (title, description, etc.).
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodemap from '../../modules/codemap';

/**
 * Parameters for updating a codemap
 */
export interface CodemapUpdateParams {
    /** The codemap ID */
    codemapId: string;
    /** Optional new title */
    title?: string;
    /** Optional new description */
    description?: string;
    /** Optional project path */
    projectPath?: string;
}

class CodemapUpdateInvocation extends BaseToolInvocation<CodemapUpdateParams, ToolResult> {
    constructor(params: CodemapUpdateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const updateData: { title?: string; description?: string } = {};
            if (this.params.title !== undefined) updateData.title = this.params.title;
            if (this.params.description !== undefined) updateData.description = this.params.description;

            const response = await cbcodemap.update(
                this.params.codemapId,
                updateData,
                this.params.projectPath
            );

            const codemap = response.payload?.codemap;

            if (!codemap) {
                return {
                    llmContent: 'Error: Failed to update codemap - no codemap returned',
                    returnDisplay: 'Error: Failed to update codemap',
                    error: {
                        message: 'No codemap returned from update operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated codemap ${this.params.codemapId}`,
                returnDisplay: `Updated codemap ${this.params.codemapId}`,
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
 * Tool for updating a codemap
 */
export class CodemapUpdateTool extends BaseDeclarativeTool<CodemapUpdateParams, ToolResult> {
    constructor() {
        super(
            'codemap_update',
            'Update Codemap',
            'Updates codemap info such as title and description.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    codemapId: {
                        type: 'string',
                        description: 'The codemap ID',
                    },
                    title: {
                        type: 'string',
                        description: 'Optional new title',
                    },
                    description: {
                        type: 'string',
                        description: 'Optional new description',
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

    protected override createInvocation(params: CodemapUpdateParams): ToolInvocation<CodemapUpdateParams, ToolResult> {
        return new CodemapUpdateInvocation(params);
    }
}
