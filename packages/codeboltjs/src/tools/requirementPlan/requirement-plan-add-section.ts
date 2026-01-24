import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import requirementPlanService from '../../modules/requirementPlan';
import type { RequirementPlanSection } from '../../modules/requirementPlan';

export interface RequirementPlanAddSectionParams {
    filePath: string;
    section: Omit<RequirementPlanSection, 'id' | 'order'>;
    afterIndex?: number;
}

class RequirementPlanAddSectionInvocation extends BaseToolInvocation<RequirementPlanAddSectionParams, ToolResult> {
    constructor(params: RequirementPlanAddSectionParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await requirementPlanService.addSection(
                this.params.filePath,
                this.params.section,
                this.params.afterIndex
            );
            
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            
            return {
                llmContent: `Section added to requirement plan`,
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

export class RequirementPlanAddSectionTool extends BaseDeclarativeTool<RequirementPlanAddSectionParams, ToolResult> {
    constructor() {
        super(
            'requirement_plan_add_section',
            'Add Section to Requirement Plan',
            'Add a section to a requirement plan',
            Kind.FileSystem,
            {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to the plan file' },
                    section: {
                        type: 'object',
                        description: 'Section data to add',
                        properties: {
                            type: { type: 'string', enum: ['markdown', 'specs-link', 'actionplan-link', 'uiflow-link', 'code-block'], description: 'Section type' },
                            title: { type: 'string', description: 'Section title' },
                            content: { type: 'string', description: 'Section content' },
                            linkedFile: { type: 'string', description: 'Linked file path (for link types)' },
                        },
                        required: ['type'],
                    },
                    afterIndex: { type: 'number', description: 'Optional index to insert after (-1 for beginning)' },
                },
                required: ['filePath', 'section'],
            }
        );
    }

    protected override createInvocation(params: RequirementPlanAddSectionParams): ToolInvocation<RequirementPlanAddSectionParams, ToolResult> {
        return new RequirementPlanAddSectionInvocation(params);
    }
}
