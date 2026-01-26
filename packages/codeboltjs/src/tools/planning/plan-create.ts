/**
 * Plan Create Tool - Creates a new action plan
 * Wraps the SDK's codeboltActionPlan.createActionPlan() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltActionPlan from '../../modules/actionPlan';

/**
 * Parameters for the PlanCreate tool
 */
export interface PlanCreateToolParams {
    /**
     * The name/title of the action plan
     */
    name: string;

    /**
     * Optional description of the action plan
     */
    description?: string;

    /**
     * Optional agent ID associated with the plan
     */
    agentId?: string;

    /**
     * Optional agent name associated with the plan
     */
    agentName?: string;

    /**
     * Optional initial status of the plan
     */
    status?: string;

    /**
     * Optional custom plan ID
     */
    planId?: string;
}

class PlanCreateToolInvocation extends BaseToolInvocation<
    PlanCreateToolParams,
    ToolResult
> {
    constructor(params: PlanCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const payload = {
                name: this.params.name,
                description: this.params.description,
                agentId: this.params.agentId,
                agentName: this.params.agentName,
                status: this.params.status,
                planId: this.params.planId,
            };

            const response = await codeboltActionPlan.createActionPlan(payload);

            if (!response) {
                return {
                    llmContent: 'Error: No response received when creating action plan',
                    returnDisplay: 'Error: Failed to create action plan',
                    error: {
                        message: 'No response received when creating action plan',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully created action plan: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating action plan: ${errorMessage}`,
                returnDisplay: `Error creating action plan: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PlanCreate tool logic
 */
export class PlanCreateTool extends BaseDeclarativeTool<
    PlanCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'plan_create';

    constructor() {
        super(
            PlanCreateTool.Name,
            'PlanCreate',
            `Creates a new action plan with the specified name and optional details. Returns the created plan with its assigned ID.`,
            Kind.Edit,
            {
                properties: {
                    name: {
                        description:
                            'The name/title of the action plan (required)',
                        type: 'string',
                    },
                    description: {
                        description:
                            'Optional: A description of the action plan and its purpose',
                        type: 'string',
                    },
                    agentId: {
                        description:
                            'Optional: The ID of the agent associated with this plan',
                        type: 'string',
                    },
                    agentName: {
                        description:
                            'Optional: The name of the agent associated with this plan',
                        type: 'string',
                    },
                    status: {
                        description:
                            "Optional: Initial status of the plan (e.g., 'active', 'pending')",
                        type: 'string',
                    },
                    planId: {
                        description:
                            'Optional: Custom plan ID. If not provided, one will be generated',
                        type: 'string',
                    },
                },
                required: ['name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PlanCreateToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: PlanCreateToolParams,
    ): ToolInvocation<PlanCreateToolParams, ToolResult> {
        return new PlanCreateToolInvocation(params);
    }
}
