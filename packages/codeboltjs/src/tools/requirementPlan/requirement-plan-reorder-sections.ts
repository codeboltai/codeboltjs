import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';

export interface RequirementPlanReorderSectionsParams {
    filePath: string;
    sectionIds: string[];
}

class RequirementPlanReorderSectionsInvocation extends BaseToolInvocation<RequirementPlanReorderSectionsParams, ToolResult> {
    constructor(params: RequirementPlanReorderSectionsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await requirementPlanService.reorderSections(
                this.params.filePath,
                this.params.sectionIds
            );
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Sections reordered in requirement plan`,
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

export class RequirementPlanReorderSectionsTool extends BaseDeclarativeTool<RequirementPlanReorderSectionsParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_reorder_sections',
            'Reorder Sections in Requirement Plan',
            'Reorder sections in a requirement plan',
            Kind.FileSystem,
            {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to the plan file' },
                    sectionIds: { 
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of section IDs in new order'
                    },
                },
                required: ['filePath', 'sectionIds'],
            }
        );
    }

    protected override createInvocation(params: RequirementPlanReorderSectionsParams): ToolInvocation<RequirementPlanReorderSectionsParams, ToolResult> {
        return new RequirementPlanReorderSectionsInvocation(params);
    }
}
