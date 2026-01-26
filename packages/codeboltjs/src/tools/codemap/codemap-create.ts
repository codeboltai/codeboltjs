/**
 * Codemap Create Tool
 * 
 * Creates a placeholder codemap with status 'creating'.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodemap from '../../modules/codemap';

/**
 * Parameters for creating a codemap
 */
export interface CodemapCreateParams {
    /** The title of the codemap */
    title: string;
    /** Optional description */
    description?: string;
    /** Optional project path */
    projectPath?: string;
}

class CodemapCreateInvocation extends BaseToolInvocation<CodemapCreateParams, ToolResult> {
    constructor(params: CodemapCreateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcodemap.create(
                {
                    title: this.params.title,
                    description: this.params.description,
                },
                this.params.projectPath
            );

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Create operation failed';
                return {
                    llmContent: `Error: Failed to create codemap - ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const codemap = response.data?.codemap;

            return {
                llmContent: `Successfully created codemap "${this.params.title}"${codemap?.id ? ` (ID: ${codemap.id})` : ''}`,
                returnDisplay: `Created codemap "${this.params.title}"`,
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
 * Tool for creating a codemap
 */
export class CodemapCreateTool extends BaseDeclarativeTool<CodemapCreateParams, ToolResult> {
    constructor() {
        super(
            'codemap_create',
            'Create Codemap',
            'Creates a placeholder codemap with status "creating". Call this before generating the actual codemap content.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'The title of the codemap',
                    },
                    description: {
                        type: 'string',
                        description: 'Optional description',
                    },
                    projectPath: {
                        type: 'string',
                        description: 'Optional project path',
                    },
                },
                required: ['title'],
            }
        );
    }

    protected override createInvocation(params: CodemapCreateParams): ToolInvocation<CodemapCreateParams, ToolResult> {
        return new CodemapCreateInvocation(params);
    }
}
