import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import roadmap from '../../modules/roadmap';

export interface GetRoadmapParams {
    projectPath?: string;
    explanation?: string;
}

class GetRoadmapInvocation extends BaseToolInvocation<GetRoadmapParams, ToolResult> {
    constructor(params: GetRoadmapParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await roadmap.getRoadmap(this.params.projectPath);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const map = response.roadmap;
            const content = `Roadmap:\n${map ? `${map.phases?.length || 0} phases, ${map.features?.length || 0} features, ${map.ideas?.length || 0} ideas` : 'No roadmap data'}`;
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

export class GetRoadmapTool extends BaseDeclarativeTool<GetRoadmapParams, ToolResult> {
    constructor() {
        super('roadmap_get', 'Get Roadmap', 'Get the project roadmap', Kind.Other, {
            type: 'object',
            properties: {
                projectPath: { type: 'string', description: 'Project path' },
                explanation: { type: 'string', description: 'Explanation' },
            },
        });
    }

    protected override createInvocation(params: GetRoadmapParams): ToolInvocation<GetRoadmapParams, ToolResult> {
        return new GetRoadmapInvocation(params);
    }
}
