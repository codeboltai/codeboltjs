/**
 * Roadmap Create Phase Tool - Creates a new phase in the roadmap
 * Wraps the SDK's codeboltRoadmap.createPhase() method
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
 * Parameters for the RoadmapCreatePhase tool
 */
export interface RoadmapCreatePhaseToolParams {
    /**
     * Name of the phase
     */
    name: string;

    /**
     * Optional description of the phase
     */
    description?: string;

    /**
     * Optional order/position of the phase
     */
    order?: number;

    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapCreatePhaseToolInvocation extends BaseToolInvocation<
    RoadmapCreatePhaseToolParams,
    ToolResult
> {
    constructor(params: RoadmapCreatePhaseToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const { name, description, order, project_path } = this.params;

            const response = await codeboltRoadmap.createPhase(
                { name, description, order },
                project_path
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully created phase: ${name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating phase: ${errorMessage}`,
                returnDisplay: `Error creating phase: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapCreatePhase tool logic
 */
export class RoadmapCreatePhaseTool extends BaseDeclarativeTool<
    RoadmapCreatePhaseToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_create_phase';

    constructor() {
        super(
            RoadmapCreatePhaseTool.Name,
            'RoadmapCreatePhase',
            `Creates a new phase in the roadmap. A phase is a major milestone or stage in the project roadmap that contains features.`,
            Kind.Edit,
            {
                properties: {
                    name: {
                        description:
                            "The name of the phase (e.g., 'Phase 1: Foundation', 'MVP Release').",
                        type: 'string',
                    },
                    description: {
                        description:
                            "Optional description of the phase explaining its goals and scope.",
                        type: 'string',
                    },
                    order: {
                        description:
                            "Optional order/position of the phase in the roadmap sequence.",
                        type: 'number',
                    },
                    project_path: {
                        description:
                            "Optional project path. If not provided, uses the active project.",
                        type: 'string',
                    },
                },
                required: ['name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: RoadmapCreatePhaseToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: RoadmapCreatePhaseToolParams,
    ): ToolInvocation<RoadmapCreatePhaseToolParams, ToolResult> {
        return new RoadmapCreatePhaseToolInvocation(params);
    }
}
