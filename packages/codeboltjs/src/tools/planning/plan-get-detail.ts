/**
 * Plan Get Detail Tool - Retrieves detailed information about a specific action plan
 * Wraps the SDK's codeboltActionPlan.getPlanDetail() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltActionPlan from '../../modules/actionPlan';

/**
 * Parameters for the PlanGetDetail tool
 */
export interface PlanGetDetailToolParams {
    /**
     * The ID of the action plan to retrieve
     */
    planId: string;
}

class PlanGetDetailToolInvocation extends BaseToolInvocation<
    PlanGetDetailToolParams,
    ToolResult
> {
    constructor(params: PlanGetDetailToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltActionPlan.getPlanDetail(this.params.planId);

            if (!response) {
                return {
                    llmContent: `Error: No response received for plan ID: ${this.params.planId}`,
                    returnDisplay: `Error: Plan not found`,
                    error: {
                        message: `No response received for plan ID: ${this.params.planId}`,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved details for plan: ${this.params.planId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting plan detail: ${errorMessage}`,
                returnDisplay: `Error getting plan detail: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PlanGetDetail tool logic
 */
export class PlanGetDetailTool extends BaseDeclarativeTool<
    PlanGetDetailToolParams,
    ToolResult
> {
    static readonly Name: string = 'plan_get_detail';

    constructor() {
        super(
            PlanGetDetailTool.Name,
            'PlanGetDetail',
            `Retrieves detailed information about a specific action plan by its ID. Returns the full plan details including all tasks, status, and metadata.`,
            Kind.Read,
            {
                properties: {
                    planId: {
                        description:
                            'The unique identifier of the action plan to retrieve details for',
                        type: 'string',
                    },
                },
                required: ['planId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PlanGetDetailToolParams,
    ): string | null {
        if (!params.planId || params.planId.trim() === '') {
            return "The 'planId' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: PlanGetDetailToolParams,
    ): ToolInvocation<PlanGetDetailToolParams, ToolResult> {
        return new PlanGetDetailToolInvocation(params);
    }
}
