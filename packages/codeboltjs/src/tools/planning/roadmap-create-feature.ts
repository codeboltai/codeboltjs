/**
 * Roadmap Create Feature Tool - Creates a new feature in a phase
 * Wraps the SDK's codeboltRoadmap.createFeature() method
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
 * Parameters for the RoadmapCreateFeature tool
 */
export interface RoadmapCreateFeatureToolParams {
    /**
     * The ID of the phase to add the feature to
     */
    phase_id: string;

    /**
     * Title of the feature
     */
    title: string;

    /**
     * Optional description of the feature
     */
    description?: string;

    /**
     * Optional impact level (low, medium, high, critical)
     */
    impact?: 'low' | 'medium' | 'high' | 'critical';

    /**
     * Optional difficulty level (easy, medium, hard, very-hard)
     */
    difficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';

    /**
     * Optional priority number
     */
    priority?: number;

    /**
     * Optional tags for categorization
     */
    tags?: string[];

    /**
     * Optional category
     */
    category?: string;

    /**
     * Optional initial status (pending, in-progress, completed, cancelled)
     */
    status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';

    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapCreateFeatureToolInvocation extends BaseToolInvocation<
    RoadmapCreateFeatureToolParams,
    ToolResult
> {
    constructor(params: RoadmapCreateFeatureToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const {
                phase_id,
                title,
                description,
                impact,
                difficulty,
                priority,
                tags,
                category,
                status,
                project_path
            } = this.params;

            const featureData: {
                title: string;
                description?: string;
                impact?: 'low' | 'medium' | 'high' | 'critical';
                difficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';
                priority?: number;
                tags?: string[];
                category?: string;
                status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
            } = { title };

            if (description !== undefined) featureData.description = description;
            if (impact !== undefined) featureData.impact = impact;
            if (difficulty !== undefined) featureData.difficulty = difficulty;
            if (priority !== undefined) featureData.priority = priority;
            if (tags !== undefined) featureData.tags = tags;
            if (category !== undefined) featureData.category = category;
            if (status !== undefined) featureData.status = status;

            const response = await codeboltRoadmap.createFeature(
                phase_id,
                featureData,
                project_path
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully created feature: ${title}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating feature: ${errorMessage}`,
                returnDisplay: `Error creating feature: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapCreateFeature tool logic
 */
export class RoadmapCreateFeatureTool extends BaseDeclarativeTool<
    RoadmapCreateFeatureToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_create_feature';

    constructor() {
        super(
            RoadmapCreateFeatureTool.Name,
            'RoadmapCreateFeature',
            `Creates a new feature in a specific phase of the roadmap. Features represent individual work items or capabilities to be implemented.`,
            Kind.Edit,
            {
                properties: {
                    phase_id: {
                        description:
                            "The unique identifier of the phase to add the feature to.",
                        type: 'string',
                    },
                    title: {
                        description:
                            "The title of the feature.",
                        type: 'string',
                    },
                    description: {
                        description:
                            "Optional detailed description of the feature.",
                        type: 'string',
                    },
                    impact: {
                        description:
                            "Optional impact level: 'low', 'medium', 'high', or 'critical'.",
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'critical'],
                    },
                    difficulty: {
                        description:
                            "Optional difficulty level: 'easy', 'medium', 'hard', or 'very-hard'.",
                        type: 'string',
                        enum: ['easy', 'medium', 'hard', 'very-hard'],
                    },
                    priority: {
                        description:
                            "Optional priority number (higher number = higher priority).",
                        type: 'number',
                    },
                    tags: {
                        description:
                            "Optional array of tags for categorization.",
                        type: 'array',
                        items: { type: 'string' },
                    },
                    category: {
                        description:
                            "Optional category for the feature.",
                        type: 'string',
                    },
                    status: {
                        description:
                            "Optional initial status: 'pending', 'in-progress', 'completed', or 'cancelled'. Defaults to 'pending'.",
                        type: 'string',
                        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
                    },
                    project_path: {
                        description:
                            "Optional project path. If not provided, uses the active project.",
                        type: 'string',
                    },
                },
                required: ['phase_id', 'title'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: RoadmapCreateFeatureToolParams,
    ): string | null {
        if (!params.phase_id || params.phase_id.trim() === '') {
            return "The 'phase_id' parameter must be a non-empty string.";
        }
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: RoadmapCreateFeatureToolParams,
    ): ToolInvocation<RoadmapCreateFeatureToolParams, ToolResult> {
        return new RoadmapCreateFeatureToolInvocation(params);
    }
}
