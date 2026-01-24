import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';

export interface RequirementPlanListParams {
    // No parameters needed for list
}

class RequirementPlanListInvocation extends BaseToolInvocation<RequirementPlanListParams, ToolResult> {
    constructor(params: RequirementPlanListParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await requirementPlanService.list();
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            const count = response.plans?.length || 0;
            return {
                llmContent: `Found ${count} requirement plan(s)`,
                returnDisplay: JSON.stringify(response.plans, null, 2),
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

export class RequirementPlanListTool extends BaseDeclarativeTool<RequirementPlanListParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_list',
            'List Requirement Plans',
            'List all requirement plans in the project',
            Kind.FileSystem,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: RequirementPlanListParams): ToolInvocation<RequirementPlanListParams, ToolResult> {
        return new RequirementPlanListInvocation(params);
    }
}
