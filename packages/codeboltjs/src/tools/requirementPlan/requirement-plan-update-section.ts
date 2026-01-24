import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';
import type { RequirementPlanSection } from '../../modules/requirementPlan';

export interface RequirementPlanUpdateSectionParams {
    filePath: string;
    sectionId: string;
    updates: Partial<RequirementPlanSection>;
}

class RequirementPlanUpdateSectionInvocation extends BaseToolInvocation<RequirementPlanUpdateSectionParams, ToolResult> {
    constructor(params: RequirementPlanUpdateSectionParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await requirementPlanService.updateSection(
                this.params.filePath,
                this.params.sectionId,
                this.params.updates
            );
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Section updated in requirement plan`,
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

export class RequirementPlanUpdateSectionTool extends BaseDeclarativeTool<RequirementPlanUpdateSectionParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_update_section',
            'Update Section in Requirement Plan',
            'Update a section in a requirement plan',
            Kind.FileSystem,
            {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to the plan file' },
                    sectionId: { type: 'string', description: 'ID of the section to update' },
                    updates: {
                        type: 'object',
                        description: 'Partial section data to update',
                        properties: {
                            type: { type: 'string', enum: ['markdown', 'specs-link', 'actionplan-link', 'uiflow-link', 'code-block'], description: 'Section type' },
                            title: { type: 'string', description: 'Section title' },
                            content: { type: 'string', description: 'Section content' },
                            linkedFile: { type: 'string', description: 'Linked file path' },
                        },
                    },
                },
                required: ['filePath', 'sectionId', 'updates'],
            }
        );
    }

    protected override createInvocation(params: RequirementPlanUpdateSectionParams): ToolInvocation<RequirementPlanUpdateSectionParams, ToolResult> {
        return new RequirementPlanUpdateSectionInvocation(params);
    }
}
