/**
 * Roadmap Delete Phase Tool - Deletes a phase from the roadmap
 * Wraps the SDK's codeboltRoadmap.deletePhase() method
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
 * Parameters for the RoadmapDeletePhase tool
 */
export interface RoadmapDeletePhaseToolParams {
    /**
     * The ID of the phase to delete
     */
    phase_id: string;

    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapDeletePhaseToolInvocation extends BaseToolInvocation<
    RoadmapDeletePhaseToolParams,
    ToolResult
> {
    constructor(params: RoadmapDeletePhaseToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const { phase_id, project_path } = this.params;

            const response = await codeboltRoadmap.deletePhase(phase_id, project_path);

            if (response.success) {
                return {
                    llmContent: JSON.stringify(response, null, 2),
                    returnDisplay: `Successfully deleted phase: ${phase_id}`,
                };
            } else {
                return {
                    llmContent: `Failed to delete phase: ${phase_id}`,
                    returnDisplay: `Failed to delete phase: ${phase_id}`,
                    error: {
                        message: `Failed to delete phase: ${phase_id}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting phase: ${errorMessage}`,
                returnDisplay: `Error deleting phase: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapDeletePhase tool logic
 */
export class RoadmapDeletePhaseTool extends BaseDeclarativeTool<
    RoadmapDeletePhaseToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_delete_phase';

    constructor() {
        super(
            RoadmapDeletePhaseTool.Name,
            'RoadmapDeletePhase',
            `Deletes a phase from the roadmap. Warning: This will also remove all features associated with the phase.`,
            Kind.Delete,
            {
                properties: {
                    phase_id: {
                        description:
                            "The unique identifier of the phase to delete.",
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
        params: RoadmapDeletePhaseToolParams,
    ): string | null {
        if (!params.phase_id || params.phase_id.trim() === '') {
            return "The 'phase_id' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: RoadmapDeletePhaseToolParams,
    ): ToolInvocation<RoadmapDeletePhaseToolParams, ToolResult> {
        return new RoadmapDeletePhaseToolInvocation(params);
    }
}
