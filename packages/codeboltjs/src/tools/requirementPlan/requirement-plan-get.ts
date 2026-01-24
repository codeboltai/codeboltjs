import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';

export interface RequirementPlanGetParams {
    filePath: string;
}

class RequirementPlanGetInvocation extends BaseToolInvocation<RequirementPlanGetParams, ToolResult> {
    constructor(params: RequirementPlanGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await requirementPlanService.get(this.params.filePath);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Retrieved requirement plan: ${response.data?.title || 'Untitled'}`,
                returnDisplay: JSON.stringify(response.data, null, 2),
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

export class RequirementPlanGetTool extends BaseDeclarativeTool<RequirementPlanGetParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_get',
            'Get Requirement Plan',
            'Get a requirement plan by file path',
            Kind.FileSystem,
            {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to the plan file' },
                },
                required: ['filePath'],
            }
        );
    }

    protected override createInvocation(params: RequirementPlanGetParams): ToolInvocation<RequirementPlanGetParams, ToolResult> {
        return new RequirementPlanGetInvocation(params);
    }
}
