/**
 * Roadmap Get Phases Tool - Retrieves all phases in the roadmap
 * Wraps the SDK's codeboltRoadmap.getPhases() method
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
 * Parameters for the RoadmapGetPhases tool
 */
export interface RoadmapGetPhasesToolParams {
    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapGetPhasesToolInvocation extends BaseToolInvocation<
    RoadmapGetPhasesToolParams,
    ToolResult
> {
    constructor(params: RoadmapGetPhasesToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltRoadmap.getPhases(this.params.project_path);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved ${response.count} phase(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting phases: ${errorMessage}`,
                returnDisplay: `Error getting phases: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapGetPhases tool logic
 */
export class RoadmapGetPhasesTool extends BaseDeclarativeTool<
    RoadmapGetPhasesToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_get_phases';

    constructor() {
        super(
            RoadmapGetPhasesTool.Name,
            'RoadmapGetPhases',
            `Retrieves all phases in the roadmap. Returns a list of phases with their details and feature counts.`,
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
        params: RoadmapGetPhasesToolParams,
    ): string | null {
        return null;
    }

    protected createInvocation(
        params: RoadmapGetPhasesToolParams,
    ): ToolInvocation<RoadmapGetPhasesToolParams, ToolResult> {
        return new RoadmapGetPhasesToolInvocation(params);
    }
}
