import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';

export interface RequirementPlanRemoveSectionParams {
    filePath: string;
    sectionId: string;
}

class RequirementPlanRemoveSectionInvocation extends BaseToolInvocation<RequirementPlanRemoveSectionParams, ToolResult> {
    constructor(params: RequirementPlanRemoveSectionParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await requirementPlanService.removeSection(
                this.params.filePath,
                this.params.sectionId
            );
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Section removed from requirement plan`,
                returnDisplay: JSON.stringify(response.document, null, 2),
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

export class RequirementPlanRemoveSectionTool extends BaseDeclarativeTool<RequirementPlanRemoveSectionParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_remove_section',
            'Remove Section from Requirement Plan',
            'Remove a section from a requirement plan',
            Kind.FileSystem,
            {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to the plan file' },
                    sectionId: { type: 'string', description: 'ID of the section to remove' },
                },
                required: ['filePath', 'sectionId'],
            }
        );
    }

    protected override createInvocation(params: RequirementPlanRemoveSectionParams): ToolInvocation<RequirementPlanRemoveSectionParams, ToolResult> {
        return new RequirementPlanRemoveSectionInvocation(params);
    }
}
