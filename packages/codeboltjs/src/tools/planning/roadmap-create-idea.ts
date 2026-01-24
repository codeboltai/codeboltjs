/**
 * Roadmap Create Idea Tool - Creates a new idea (pre-roadmap suggestion)
 * Wraps the SDK's codeboltRoadmap.createIdea() method
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
 * Parameters for the RoadmapCreateIdea tool
 */
export interface RoadmapCreateIdeaToolParams {
    /**
     * Title of the idea
     */
    title: string;

    /**
     * Optional description of the idea
     */
    description?: string;

    /**
     * Optional category for the idea
     */
    category?: string;

    /**
     * Optional suggested impact level (low, medium, high, critical)
     */
    suggested_impact?: 'low' | 'medium' | 'high' | 'critical';

    /**
     * Optional suggested difficulty level (easy, medium, hard, very-hard)
     */
    suggested_difficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';

    /**
     * Optional tags for categorization
     */
    tags?: string[];

    /**
     * Optional project path (uses active project if not provided)
     */
    project_path?: string;
}

class RoadmapCreateIdeaToolInvocation extends BaseToolInvocation<
    RoadmapCreateIdeaToolParams,
    ToolResult
> {
    constructor(params: RoadmapCreateIdeaToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [];
    }

    async execute(): Promise<ToolResult> {
        try {
            const {
                title,
                description,
                category,
                suggested_impact,
                suggested_difficulty,
                tags,
                project_path
            } = this.params;

            const ideaData: {
                title: string;
                description?: string;
                category?: string;
                suggestedImpact?: 'low' | 'medium' | 'high' | 'critical';
                suggestedDifficulty?: 'easy' | 'medium' | 'hard' | 'very-hard';
                tags?: string[];
            } = { title };

            if (description !== undefined) ideaData.description = description;
            if (category !== undefined) ideaData.category = category;
            if (suggested_impact !== undefined) ideaData.suggestedImpact = suggested_impact;
            if (suggested_difficulty !== undefined) ideaData.suggestedDifficulty = suggested_difficulty;
            if (tags !== undefined) ideaData.tags = tags;

            const response = await codeboltRoadmap.createIdea(ideaData, project_path);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully created idea: ${title}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating idea: ${errorMessage}`,
                returnDisplay: `Error creating idea: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the RoadmapCreateIdea tool logic
 */
export class RoadmapCreateIdeaTool extends BaseDeclarativeTool<
    RoadmapCreateIdeaToolParams,
    ToolResult
> {
    static readonly Name: string = 'roadmap_create_idea';

    constructor() {
        super(
            RoadmapCreateIdeaTool.Name,
            'RoadmapCreateIdea',
            `Creates a new idea (pre-roadmap suggestion). Ideas are suggestions that can later be reviewed and moved to the roadmap as features.`,
            Kind.Edit,
            {
                properties: {
                    title: {
                        description:
                            "The title of the idea.",
                        type: 'string',
                    },
                    description: {
                        description:
                            "Optional detailed description of the idea.",
                        type: 'string',
                    },
                    category: {
                        description:
                            "Optional category for the idea.",
                        type: 'string',
                    },
                    suggested_impact: {
                        description:
                            "Optional suggested impact level: 'low', 'medium', 'high', or 'critical'.",
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'critical'],
                    },
                    suggested_difficulty: {
                        description:
                            "Optional suggested difficulty level: 'easy', 'medium', 'hard', or 'very-hard'.",
                        type: 'string',
                        enum: ['easy', 'medium', 'hard', 'very-hard'],
                    },
                    tags: {
                        description:
                            "Optional array of tags for categorization.",
                        type: 'array',
                        items: { type: 'string' },
                    },
                    project_path: {
                        description:
                            "Optional project path. If not provided, uses the active project.",
                        type: 'string',
                    },
                },
                required: ['title'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: RoadmapCreateIdeaToolParams,
    ): string | null {
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: RoadmapCreateIdeaToolParams,
    ): ToolInvocation<RoadmapCreateIdeaToolParams, ToolResult> {
        return new RoadmapCreateIdeaToolInvocation(params);
    }
}
