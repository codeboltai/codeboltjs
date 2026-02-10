import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';

export interface RequirementPlanReviewParams {
    filePath: string;
}

class RequirementPlanReviewInvocation extends BaseToolInvocation<RequirementPlanReviewParams, ToolResult> {
    constructor(params: RequirementPlanReviewParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {

            const response: any = await requirementPlanService.review(this.params.filePath);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            return {
                llmContent: `Requirement plan review status: ${response.data.status || 'pending'}`,
                returnDisplay: `Review status: ${response.status || 'pending'}`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class RequirementPlanReviewTool extends BaseDeclarativeTool<RequirementPlanReviewParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_review',
            'Review Requirement Plan',
            'Request a review for a requirement plan',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to the plan file' },
                },
                required: ['filePath'],
            }
        );
    }

    protected override createInvocation(params: RequirementPlanReviewParams): ToolInvocation<RequirementPlanReviewParams, ToolResult> {
        return new RequirementPlanReviewInvocation(params);
    }
}
