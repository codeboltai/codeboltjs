/**
 * Codemap Save Tool
 * 
 * Saves a complete codemap with content.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodemap from '../../modules/codemap';
import type { Codemap } from '../../types/codemap';

/**
 * Parameters for saving a codemap
 */
export interface CodemapSaveParams {
    /** The codemap ID */
    codemapId: string;
    /** The complete codemap data */
    codemap: Codemap;
    /** Optional project path */
    projectPath?: string;
}

class CodemapSaveInvocation extends BaseToolInvocation<CodemapSaveParams, ToolResult> {
    constructor(params: CodemapSaveParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcodemap.save(
                this.params.codemapId,
                this.params.codemap,
                this.params.projectPath
            );

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Save operation failed';
                return {
                    llmContent: `Error: Failed to save codemap - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully saved codemap ${this.params.codemapId}`,
                returnDisplay: `Saved codemap ${this.params.codemapId}`,
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
 * Tool for saving a codemap
 */
export class CodemapSaveTool extends BaseDeclarativeTool<CodemapSaveParams, ToolResult> {
    constructor() {
        super(
            'codemap_save',
            'Save Codemap',
            'Saves a complete codemap with content.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    codemapId: {
                        type: 'string',
                        description: 'The codemap ID',
                    },
                    codemap: {
                        type: 'object',
                        description: 'The complete codemap data',
                    },
                    projectPath: {
                        type: 'string',
                        description: 'Optional project path',
                    },
                },
                required: ['codemapId', 'codemap'],
            }
        );
    }

    protected override createInvocation(params: CodemapSaveParams): ToolInvocation<CodemapSaveParams, ToolResult> {
        return new CodemapSaveInvocation(params);
    }
}
