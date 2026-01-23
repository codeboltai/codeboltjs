/**
 * Roadmap Get Features Tool - Retrieves features in a specific phase
 * Wraps the SDK's codeboltRoadmap.getFeatures() method
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
 * Parameters for the RoadmapGetFeatures tool
 */
export interface RoadmapGetFeaturesToolParams {
    /**
     * The ID of the phase to get features for
     */
    phase_id: string;

    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapGetFeaturesToolInvocation extends BaseToolInvocation<
    RoadmapGetFeaturesToolParams,
    ToolResult
> {
    constructor(params: RoadmapGetFeaturesToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const { phase_id, project_path } = this.params;

            const response = await codeboltRoadmap.getFeatures(phase_id, project_path);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully retrieved ${response.count} feature(s) for phase: ${phase_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting features: ${errorMessage}`,
                returnDisplay: `Error getting features: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapGetFeatures tool logic
 */
export class RoadmapGetFeaturesTool extends BaseDeclarativeTool<
    RoadmapGetFeaturesToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_get_features';

    constructor() {
        super(
            RoadmapGetFeaturesTool.Name,
            'RoadmapGetFeatures',
            `Retrieves all features in a specific phase of the roadmap. Returns a list of features with their details, status, and metadata.`,
            Kind.Read,
            {
                properties: {
                    phase_id: {
                        description:
                            "The unique identifier of the phase to get features for.",
                        type: 'string',
                    },
                    project_path: {
                        description:
                            "Optional project path. If not provided, uses the active project.",
                        type: 'string',
                    },
                },
                required: ['phase_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: RoadmapGetFeaturesToolParams,
    ): string | null {
        if (!params.phase_id || params.phase_id.trim() === '') {
            return "The 'phase_id' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: RoadmapGetFeaturesToolParams,
    ): ToolInvocation<RoadmapGetFeaturesToolParams, ToolResult> {
        return new RoadmapGetFeaturesToolInvocation(params);
    }
}
