/**
 * Plan Get All Tool - Retrieves all action plans
 * Wraps the SDK's codeboltActionPlan.getAllPlans() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltActionPlan from '../../modules/actionPlan';

/**
 * Parameters for the PlanGetAll tool
 */
export interface PlanGetAllToolParams {
    /**
     * Optional filter by status
     */
    status?: string;

    /**
     * Optional filter by agent ID
     */
    agentId?: string;
}

class PlanGetAllToolInvocation extends BaseToolInvocation<
    PlanGetAllToolParams,
    ToolResult
> {
    constructor(params: PlanGetAllToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltActionPlan.getAllPlans();

            if (!response) {
                return {
                    llmContent: 'Error: No response received from getAllPlans',
                    returnDisplay: 'Error: No response received',
                    error: {
                        message: 'No response received from getAllPlans',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            // Filter results if filters are provided
            let plans = response.plans || response;

            if (this.params.status && Array.isArray(plans)) {
                plans = plans.filter((plan: any) => plan.status === this.params.status);
            }

            if (this.params.agentId && Array.isArray(plans)) {
                plans = plans.filter((plan: any) => plan.agentId === this.params.agentId);
            }

            const planCount = Array.isArray(plans) ? plans.length : 0;

            return {
                llmContent: JSON.stringify(plans, null, 2),
                returnDisplay: `Successfully retrieved ${planCount} action plan(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting all plans: ${errorMessage}`,
                returnDisplay: `Error getting all plans: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PlanGetAll tool logic
 */
export class PlanGetAllTool extends BaseDeclarativeTool<
    PlanGetAllToolParams,
    ToolResult
> {
    static readonly Name: string = 'plan_get_all';

    constructor() {
        super(
            PlanGetAllTool.Name,
            'PlanGetAll',
            `Retrieves all action plans. Can optionally filter by status or agent ID. Returns a list of all action plans with their basic information.`,
            Kind.Read,
            {
                properties: {
                    status: {
                        description:
                            "Optional: Filter plans by status (e.g., 'active', 'completed', 'pending')",
                        type: 'string',
                    },
                    agentId: {
                        description:
                            'Optional: Filter plans by agent ID',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: PlanGetAllToolParams,
    ): ToolInvocation<PlanGetAllToolParams, ToolResult> {
        return new PlanGetAllToolInvocation(params);
    }
}
