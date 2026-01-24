import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import roadmap from '../../modules/roadmap';

export interface CreateRoadmapPhaseParams {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    order?: number;
    projectPath?: string;
    explanation?: string;
}

class CreateRoadmapPhaseInvocation extends BaseToolInvocation<CreateRoadmapPhaseParams, ToolResult> {
    constructor(params: CreateRoadmapPhaseParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const data = {
                name: this.params.name,
                description: this.params.description,
                startDate: this.params.startDate,
                endDate: this.params.endDate,
                status: this.params.status,
                order: this.params.order,
            };
            const response = await roadmap.createPhase(data, this.params.projectPath);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Phase "${this.params.name}" created in roadmap`;
            return { llmContent: content, returnDisplay: content };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class CreateRoadmapPhaseTool extends BaseDeclarativeTool<CreateRoadmapPhaseParams, ToolResult> {
    constructor() {
        super('roadmap_createPhase', 'Create Roadmap Phase', 'Create a new phase in the roadmap', Kind.Other, {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Phase name' },
                description: { type: 'string', description: 'Phase description' },
                startDate: { type: 'string', description: 'Start date' },
                endDate: { type: 'string', description: 'End date' },
                status: { type: 'string', description: 'Phase status' },
                order: { type: 'number', description: 'Phase order' },
                projectPath: { type: 'string', description: 'Project path' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['name'],
        });
    }

    protected override createInvocation(params: CreateRoadmapPhaseParams): ToolInvocation<CreateRoadmapPhaseParams, ToolResult> {
        return new CreateRoadmapPhaseInvocation(params);
    }
}
