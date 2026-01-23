/**
 * Codemap Update Tool - Updates an existing codemap
 * Wraps the SDK's codeboltCodemap.update() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCodemap from '../../modules/codemap';
import type { CodemapStatus } from '../../types/codemap';

/**
 * Parameters for the CodemapUpdate tool
 */
export interface CodemapUpdateToolParams {
    /**
     * The ID of the codemap to update
     */
    codemap_id: string;

    /**
     * Optional new title for the codemap
     */
    title?: string;

    /**
     * Optional new description for the codemap
     */
    description?: string;

    /**
     * Optional new status for the codemap ('creating' | 'done' | 'error')
     */
    status?: CodemapStatus;

    /**
     * Optional error message (used when status is 'error')
     */
    error?: string;

    /**
     * Optional project path
     */
    project_path?: string;
}

class CodemapUpdateToolInvocation extends BaseToolInvocation<
    CodemapUpdateToolParams,
    ToolResult
> {
    constructor(params: CodemapUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const updateData: {
                title?: string;
                description?: string;
                status?: CodemapStatus;
                error?: string;
            } = {};

            if (this.params.title !== undefined) {
                updateData.title = this.params.title;
            }
            if (this.params.description !== undefined) {
                updateData.description = this.params.description;
            }
            if (this.params.status !== undefined) {
                updateData.status = this.params.status;
            }
            if (this.params.error !== undefined) {
                updateData.error = this.params.error;
            }

            const response = await codeboltCodemap.update(
                this.params.codemap_id,
                updateData,
                this.params.project_path
            );

            if (!response || !response.codemap) {
                return {
                    llmContent: `Failed to update codemap with ID '${this.params.codemap_id}'.`,
                    returnDisplay: `Failed to update codemap: ${this.params.codemap_id}`,
                    error: {
                        message: `Failed to update codemap with ID '${this.params.codemap_id}'`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const llmContent = JSON.stringify({
                message: 'Codemap updated successfully',
                codemap: response.codemap,
            }, null, 2);

            return {
                llmContent,
                returnDisplay: `Updated codemap: ${response.codemap.title} (ID: ${response.codemap.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating codemap: ${errorMessage}`,
                returnDisplay: `Error updating codemap: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CodemapUpdate tool
 */
export class CodemapUpdateTool extends BaseDeclarativeTool<
    CodemapUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'codemap_update';

    constructor() {
        super(
            CodemapUpdateTool.Name,
            'CodemapUpdate',
            'Updates an existing codemap with new title, description, status, or error information. At least one update field must be provided.',
            Kind.Edit,
            {
                properties: {
                    codemap_id: {
                        description:
                            'The unique identifier of the codemap to update.',
                        type: 'string',
                    },
                    title: {
                        description:
                            'Optional new title for the codemap.',
                        type: 'string',
                    },
                    description: {
                        description:
                            'Optional new description for the codemap.',
                        type: 'string',
                    },
                    status: {
                        description:
                            "Optional new status for the codemap. Valid values: 'creating', 'done', 'error'.",
                        type: 'string',
                        enum: ['creating', 'done', 'error'],
                    },
                    error: {
                        description:
                            "Optional error message. Typically used when setting status to 'error'.",
                        type: 'string',
                    },
                    project_path: {
                        description:
                            'Optional project path. If not provided, uses the current project.',
                        type: 'string',
                    },
                },
                required: ['codemap_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CodemapUpdateToolParams,
    ): string | null {
        if (!params.codemap_id || params.codemap_id.trim() === '') {
            return "The 'codemap_id' parameter must be non-empty.";
        }

        // Check that at least one update field is provided
        const hasUpdateField =
            params.title !== undefined ||
            params.description !== undefined ||
            params.status !== undefined ||
            params.error !== undefined;

        if (!hasUpdateField) {
            return "At least one update field (title, description, status, or error) must be provided.";
        }

        // Validate status if provided
        if (params.status !== undefined) {
            const validStatuses = ['creating', 'done', 'error'];
            if (!validStatuses.includes(params.status)) {
                return `Invalid status '${params.status}'. Valid values are: ${validStatuses.join(', ')}`;
            }
        }

        return null;
    }

    protected createInvocation(
        params: CodemapUpdateToolParams,
    ): ToolInvocation<CodemapUpdateToolParams, ToolResult> {
        return new CodemapUpdateToolInvocation(params);
    }
}
