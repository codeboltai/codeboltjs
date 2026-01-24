import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import roadmap from '../../modules/roadmap';

export interface CreateRoadmapIdeaParams {
    title: string;
    description?: string;
    priority?: string;
    category?: string;
    estimatedEffort?: string;
    projectPath?: string;
    explanation?: string;
}

class CreateRoadmapIdeaInvocation extends BaseToolInvocation<CreateRoadmapIdeaParams, ToolResult> {
    constructor(params: CreateRoadmapIdeaParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const data = {
                title: this.params.title,
                description: this.params.description,
                priority: this.params.priority,
                category: this.params.category,
                estimatedEffort: this.params.estimatedEffort,
            };
            const response = await roadmap.createIdea(data, this.params.projectPath);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Idea "${this.params.title}" added to roadmap`;
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

export class CreateRoadmapIdeaTool extends BaseDeclarativeTool<CreateRoadmapIdeaParams, ToolResult> {
    constructor() {
        super('roadmap_createIdea', 'Create Roadmap Idea', 'Create a new idea in the roadmap', Kind.Other, {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Idea title' },
                description: { type: 'string', description: 'Idea description' },
                priority: { type: 'string', description: 'Idea priority' },
                category: { type: 'string', description: 'Idea category' },
                estimatedEffort: { type: 'string', description: 'Estimated effort' },
                projectPath: { type: 'string', description: 'Project path' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['title'],
        });
    }

    protected override createInvocation(params: CreateRoadmapIdeaParams): ToolInvocation<CreateRoadmapIdeaParams, ToolResult> {
        return new CreateRoadmapIdeaInvocation(params);
    }
}
