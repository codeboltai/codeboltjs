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

            const map = response.roadmap;
            if (!map) {
                return {
                    llmContent: 'Error: No roadmap data found',
                    returnDisplay: 'Error: No roadmap data found',
                    error: { message: 'No roadmap data found', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            // Count all features across all phases
            const totalFeatures = map.phases?.reduce((sum, phase) => sum + (phase.features?.length || 0), 0) || 0;
            const content = `Roadmap:\n${map.phases?.length || 0} phases, ${totalFeatures} features, ${map.ideas?.length || 0} ideas`;
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
