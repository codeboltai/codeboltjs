import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';

export interface RequirementPlanCreateParams {
    fileName: string;
}

class RequirementPlanCreateInvocation extends BaseToolInvocation<RequirementPlanCreateParams, ToolResult> {
    constructor(params: RequirementPlanCreateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await requirementPlanService.create(this.params.fileName);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Requirement plan created at: ${response.filePath}`,
                returnDisplay: `Created requirement plan: ${response.filePath}`,
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

export class RequirementPlanCreateTool extends BaseDeclarativeTool<RequirementPlanCreateParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_create',
            'Create Requirement Plan',
            'Create a new requirement plan file',
            Kind.FileSystem,
            {
                type: 'object',
                properties: {
                    fileName: { type: 'string', description: 'Name for the new plan file (without .plan extension)' },
                },
                required: ['fileName'],
            }
        );
    }

    protected override createInvocation(params: RequirementPlanCreateParams): ToolInvocation<RequirementPlanCreateParams, ToolResult> {
        return new RequirementPlanCreateInvocation(params);
    }
}
