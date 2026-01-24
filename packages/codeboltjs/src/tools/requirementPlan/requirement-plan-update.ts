import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';
import type { RequirementPlanDocument } from '../../modules/requirementPlan';

export interface RequirementPlanUpdateParams {
    filePath: string;
    content: string | RequirementPlanDocument;
}

class RequirementPlanUpdateInvocation extends BaseToolInvocation<RequirementPlanUpdateParams, ToolResult> {
    constructor(params: RequirementPlanUpdateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await requirementPlanService.update(this.params.filePath, this.params.content);
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Requirement plan updated: ${response.filePath}`,
                returnDisplay: `Updated requirement plan: ${response.filePath}`,
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

export class RequirementPlanUpdateTool extends BaseDeclarativeTool<RequirementPlanUpdateParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_update',
            'Update Requirement Plan',
            'Update a requirement plan with new content',
            Kind.FileSystem,
            {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to the plan file' },
                    content: { description: 'New content (string or RequirementPlanDocument object)' },
                },
                required: ['filePath', 'content'],
            }
        );
    }

    protected override createInvocation(params: RequirementPlanUpdateParams): ToolInvocation<RequirementPlanUpdateParams, ToolResult> {
        return new RequirementPlanUpdateInvocation(params);
    }
}
