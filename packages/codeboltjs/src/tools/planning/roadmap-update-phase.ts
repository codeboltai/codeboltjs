/**
 * Roadmap Update Phase Tool - Updates an existing phase in the roadmap
 * Wraps the SDK's codeboltRoadmap.updatePhase() method
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
 * Parameters for the RoadmapUpdatePhase tool
 */
export interface RoadmapUpdatePhaseToolParams {
    /**
     * The ID of the phase to update
     */
    phase_id: string;

    /**
     * Optional new name for the phase
     */
    name?: string;

    /**
     * Optional new description for the phase
     */
    description?: string;

    /**
     * Optional new order/position for the phase
     */
    order?: number;

    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapUpdatePhaseToolInvocation extends BaseToolInvocation<
    RoadmapUpdatePhaseToolParams,
    ToolResult
> {
    constructor(params: RoadmapUpdatePhaseToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const { phase_id, name, description, order, project_path } = this.params;

            const updates: { name?: string; description?: string; order?: number } = {};
            if (name !== undefined) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (order !== undefined) updates.order = order;

            const response = await codeboltRoadmap.updatePhase(
                phase_id,
                updates,
                project_path
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated phase: ${phase_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating phase: ${errorMessage}`,
                returnDisplay: `Error updating phase: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapUpdatePhase tool logic
 */
export class RoadmapUpdatePhaseTool extends BaseDeclarativeTool<
    RoadmapUpdatePhaseToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_update_phase';

    constructor() {
        super(
            RoadmapUpdatePhaseTool.Name,
            'RoadmapUpdatePhase',
            `Updates an existing phase in the roadmap. Can modify the phase name, description, or order.`,
            Kind.Edit,
            {
                properties: {
                    phase_id: {
                        description:
                            "The unique identifier of the phase to update.",
                        type: 'string',
                    },
                    name: {
                        description:
                            "Optional new name for the phase.",
                        type: 'string',
                    },
                    description: {
                        description:
                            "Optional new description for the phase.",
                        type: 'string',
                    },
                    order: {
                        description:
                            "Optional new order/position for the phase in the roadmap sequence.",
                        type: 'number',
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
        params: RoadmapUpdatePhaseToolParams,
    ): string | null {
        if (!params.phase_id || params.phase_id.trim() === '') {
            return "The 'phase_id' parameter must be a non-empty string.";
        }

        // Ensure at least one update field is provided
        if (params.name === undefined && params.description === undefined && params.order === undefined) {
            return "At least one of 'name', 'description', or 'order' must be provided for update.";
        }

        return null;
    }

    protected createInvocation(
        params: RoadmapUpdatePhaseToolParams,
    ): ToolInvocation<RoadmapUpdatePhaseToolParams, ToolResult> {
        return new RoadmapUpdatePhaseToolInvocation(params);
    }
}
