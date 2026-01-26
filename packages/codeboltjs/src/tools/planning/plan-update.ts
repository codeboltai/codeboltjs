/**
 * Plan Update Tool - Updates an existing action plan
 * Wraps the SDK's codeboltActionPlan.updateActionPlan() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltActionPlan from '../../modules/actionPlan';

/**
 * Parameters for the PlanUpdate tool
 */
export interface PlanUpdateToolParams {
    /**
     * The ID of the action plan to update
     */
    planId: string;

    /**
     * The updates to apply to the action plan
     */
    updates: {
        /**
         * Optional new name for the plan
         */
        name?: string;

        /**
         * Optional new description for the plan
         */
        description?: string;

        /**
         * Optional new status for the plan
         */
        status?: string;

        /**
         * Optional new agent ID
         */
        agentId?: string;

        /**
         * Optional new agent name
         */
        agentName?: string;

        /**
         * Any other update fields
         */
        [key: string]: any;
    };
}

class PlanUpdateToolInvocation extends BaseToolInvocation<
    PlanUpdateToolParams,
    ToolResult
> {
    constructor(params: PlanUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltActionPlan.updateActionPlan(
                this.params.planId,
                this.params.updates
            );

            if (!response) {
                return {
                    llmContent: `Error: No response received when updating plan: ${this.params.planId}`,
                    returnDisplay: 'Error: Failed to update action plan',
                    error: {
                        message: `No response received when updating plan: ${this.params.planId}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated action plan: ${this.params.planId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating action plan: ${errorMessage}`,
                returnDisplay: `Error updating action plan: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PlanUpdate tool logic
 */
export class PlanUpdateTool extends BaseDeclarativeTool<
    PlanUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'plan_update';

    constructor() {
        super(
            PlanUpdateTool.Name,
            'PlanUpdate',
            `Updates an existing action plan with the specified changes. Can update name, description, status, and other plan properties.`,
            Kind.Edit,
            {
                properties: {
                    planId: {
                        description:
                            'The unique identifier of the action plan to update (required)',
                        type: 'string',
                    },
                    updates: {
                        description:
                            'An object containing the fields to update (required)',
                        type: 'object',
                        properties: {
                            name: {
                                description: 'New name for the plan',
                                type: 'string',
                            },
                            description: {
                                description: 'New description for the plan',
                                type: 'string',
                            },
                            status: {
                                description: 'New status for the plan',
                                type: 'string',
                            },
                            agentId: {
                                description: 'New agent ID',
                                type: 'string',
                            },
                            agentName: {
                                description: 'New agent name',
                                type: 'string',
                            },
                        },
                    },
                },
                required: ['planId', 'updates'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PlanUpdateToolParams,
    ): string | null {
        if (!params.planId || params.planId.trim() === '') {
            return "The 'planId' parameter must be a non-empty string.";
        }
        if (!params.updates || typeof params.updates !== 'object') {
            return "The 'updates' parameter must be an object.";
        }
        if (Object.keys(params.updates).length === 0) {
            return "The 'updates' parameter must contain at least one field to update.";
        }
        return null;
    }

    protected createInvocation(
        params: PlanUpdateToolParams,
    ): ToolInvocation<PlanUpdateToolParams, ToolResult> {
        return new PlanUpdateToolInvocation(params);
    }
}
