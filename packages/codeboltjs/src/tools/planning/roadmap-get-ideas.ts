/**
 * Roadmap Get Ideas Tool - Retrieves all ideas (pre-roadmap suggestions)
 * Wraps the SDK's codeboltRoadmap.getIdeas() method
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
 * Parameters for the RoadmapGetIdeas tool
 */
export interface RoadmapGetIdeasToolParams {
    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapGetIdeasToolInvocation extends BaseToolInvocation<
    RoadmapGetIdeasToolParams,
    ToolResult
> {
    constructor(params: RoadmapGetIdeasToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltRoadmap.getIdeas(this.params.project_path);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved ${response.count} idea(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting ideas: ${errorMessage}`,
                returnDisplay: `Error getting ideas: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapGetIdeas tool logic
 */
export class RoadmapGetIdeasTool extends BaseDeclarativeTool<
    RoadmapGetIdeasToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_get_ideas';

    constructor() {
        super(
            RoadmapGetIdeasTool.Name,
            'RoadmapGetIdeas',
            `Retrieves all ideas (pre-roadmap suggestions) for the project. Ideas are suggestions that haven't been approved and added to the roadmap yet.`,
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
        params: RoadmapGetIdeasToolParams,
    ): string | null {
        return null;
    }

    protected createInvocation(
        params: RoadmapGetIdeasToolParams,
    ): ToolInvocation<RoadmapGetIdeasToolParams, ToolResult> {
        return new RoadmapGetIdeasToolInvocation(params);
    }
}
