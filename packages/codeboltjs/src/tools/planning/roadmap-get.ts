/**
 * Roadmap Get Tool - Retrieves the complete roadmap for a project
 * Wraps the SDK's codeboltRoadmap.getRoadmap() method
 */

import type {
    ToolInvocation,
    ToolLocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltRoadmap from '../../modules/roadmap';

/**
 * Parameters for the RoadmapGet tool
 */
export interface RoadmapGetToolParams {
    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapGetToolInvocation extends BaseToolInvocation<
    RoadmapGetToolParams,
    ToolResult
> {
    constructor(params: RoadmapGetToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltRoadmap.getRoadmap(this.params.project_path);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved roadmap`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting roadmap: ${errorMessage}`,
                returnDisplay: `Error getting roadmap: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapGet tool logic
 */
export class RoadmapGetTool extends BaseDeclarativeTool<
    RoadmapGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_get';

    constructor() {
        super(
            RoadmapGetTool.Name,
            'RoadmapGet',
            `Retrieves the complete roadmap for a project, including all phases, features, and ideas. Returns the full roadmap data structure.`,
            Kind.Read,
            {
                properties: {
                    project_path: {
                        description:
                            "Optional project path. If not provided, uses the active project.",
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: RoadmapGetToolParams,
    ): string | null {
        return null;
    }

    protected createInvocation(
        params: RoadmapGetToolParams,
    ): ToolInvocation<RoadmapGetToolParams, ToolResult> {
        return new RoadmapGetToolInvocation(params);
    }
}
