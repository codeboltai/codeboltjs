/**
 * Roadmap Update Feature Tool - Updates an existing feature
 * Wraps the SDK's codeboltRoadmap.updateFeature() method
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
 * Parameters for the RoadmapUpdateFeature tool
 */
export interface RoadmapUpdateFeatureToolParams {
    /**
     * The ID of the feature to update
     */
    feature_id: string;

    /**
     * Optional new title for the feature
     */
    title?: string;

    /**
     * Optional new description for the feature
     */
    description?: string;

    /**
     * Optional new impact level (low, medium, high, critical)
     */
    impact?: 'low' | 'medium' | 'high' | 'critical';

    /**
     * Optional new difficulty level (easy, medium, hard, very-hard)
     */
    difficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';

    /**
     * Optional new priority number
     */
    priority?: number;

    /**
     * Optional new tags for categorization
     */
    tags?: string[];

    /**
     * Optional new category
     */
    category?: string;

    /**
     * Optional new status (pending, in-progress, completed, cancelled)
     */
    status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';

    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapUpdateFeatureToolInvocation extends BaseToolInvocation<
    RoadmapUpdateFeatureToolParams,
    ToolResult
> {
    constructor(params: RoadmapUpdateFeatureToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const {
                feature_id,
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

            const updates: {
                title?: string;
                description?: string;
                impact?: 'low' | 'medium' | 'high' | 'critical';
                difficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';
                priority?: number;
                tags?: string[];
                category?: string;
                status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
            } = {};

            if (title !== undefined) updates.title = title;
            if (description !== undefined) updates.description = description;
            if (impact !== undefined) updates.impact = impact;
            if (difficulty !== undefined) updates.difficulty = difficulty;
            if (priority !== undefined) updates.priority = priority;
            if (tags !== undefined) updates.tags = tags;
            if (category !== undefined) updates.category = category;
            if (status !== undefined) updates.status = status;

            const response = await codeboltRoadmap.updateFeature(
                feature_id,
                updates,
                project_path
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated feature: ${feature_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating feature: ${errorMessage}`,
                returnDisplay: `Error updating feature: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapUpdateFeature tool logic
 */
export class RoadmapUpdateFeatureTool extends BaseDeclarativeTool<
    RoadmapUpdateFeatureToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_update_feature';

    constructor() {
        super(
            RoadmapUpdateFeatureTool.Name,
            'RoadmapUpdateFeature',
            `Updates an existing feature in the roadmap. Can modify the feature's title, description, impact, difficulty, priority, tags, category, or status.`,
            Kind.Edit,
            {
                properties: {
                    feature_id: {
                        description:
                            "The unique identifier of the feature to update.",
                        type: 'string',
                    },
                    title: {
                        description:
                            "Optional new title for the feature.",
                        type: 'string',
                    },
                    description: {
                        description:
                            "Optional new description for the feature.",
                        type: 'string',
                    },
                    impact: {
                        description:
                            "Optional new impact level: 'low', 'medium', 'high', or 'critical'.",
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'critical'],
                    },
                    difficulty: {
                        description:
                            "Optional new difficulty level: 'easy', 'medium', 'hard', or 'very-hard'.",
                        type: 'string',
                        enum: ['easy', 'medium', 'hard', 'very-hard'],
                    },
                    priority: {
                        description:
                            "Optional new priority number.",
                        type: 'number',
                    },
                    tags: {
                        description:
                            "Optional new array of tags for categorization.",
                        type: 'array',
                        items: { type: 'string' },
                    },
                    category: {
                        description:
                            "Optional new category for the feature.",
                        type: 'string',
                    },
                    status: {
                        description:
                            "Optional new status: 'pending', 'in-progress', 'completed', or 'cancelled'.",
                        type: 'string',
                        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
                    },
                    project_path: {
                        description:
                            "Optional project path. If not provided, uses the active project.",
                        type: 'string',
                    },
                },
                required: ['feature_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: RoadmapUpdateFeatureToolParams,
    ): string | null {
        if (!params.feature_id || params.feature_id.trim() === '') {
            return "The 'feature_id' parameter must be a non-empty string.";
        }

        // Ensure at least one update field is provided
        const hasUpdate = params.title !== undefined ||
                          params.description !== undefined ||
                          params.impact !== undefined ||
                          params.difficulty !== undefined ||
                          params.priority !== undefined ||
                          params.tags !== undefined ||
                          params.category !== undefined ||
                          params.status !== undefined;

        if (!hasUpdate) {
            return "At least one field must be provided for update.";
        }

        return null;
    }

    protected createInvocation(
        params: RoadmapUpdateFeatureToolParams,
    ): ToolInvocation<RoadmapUpdateFeatureToolParams, ToolResult> {
        return new RoadmapUpdateFeatureToolInvocation(params);
    }
}
