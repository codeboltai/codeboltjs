/**
 * Deliberation Create Tool - Creates a new deliberation session
 * Wraps the SDK's cbagentDeliberation.create() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';
import type { DeliberationType, DeliberationStatus } from '../../types/agentDeliberation';

/**
 * Parameters for the DeliberationCreate tool
 */
export interface DeliberationCreateToolParams {
    /**
     * The type of deliberation (voting, feedback, qa, shared-list)
     */
    deliberation_type: DeliberationType;

    /**
     * The title of the deliberation
     */
    title: string;

    /**
     * The request message describing what needs to be deliberated
     */
    request_message: string;

    /**
     * The ID of the creator
     */
    creator_id: string;

    /**
     * The name of the creator
     */
    creator_name: string;

    /**
     * Optional list of participant IDs
     */
    participants?: string[];

    /**
     * Optional initial status of the deliberation
     */
    status?: DeliberationStatus;
}

class DeliberationCreateToolInvocation extends BaseToolInvocation<
    DeliberationCreateToolParams,
    ToolResult
> {
    constructor(params: DeliberationCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.create({
                deliberationType: this.params.deliberation_type,
                title: this.params.title,
                requestMessage: this.params.request_message,
                creatorId: this.params.creator_id,
                creatorName: this.params.creator_name,
                participants: this.params.participants,
                status: this.params.status,
            });

            const deliberation = response.payload?.deliberation;

            if (!deliberation) {
                return {
                    llmContent: 'Error: Failed to create deliberation - no deliberation returned',
                    returnDisplay: 'Error: Failed to create deliberation',
                    error: {
                        message: 'No deliberation returned from create operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resultContent = JSON.stringify(deliberation, null, 2);

            return {
                llmContent: `Successfully created deliberation:\n${resultContent}`,
                returnDisplay: `Successfully created deliberation "${deliberation.title}" (ID: ${deliberation.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating deliberation: ${errorMessage}`,
                returnDisplay: `Error creating deliberation: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the DeliberationCreate tool logic
 */
export class DeliberationCreateTool extends BaseDeclarativeTool<
    DeliberationCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'deliberation_create';

    constructor() {
        super(
            DeliberationCreateTool.Name,
            'DeliberationCreate',
            `Creates a new deliberation session for agent collaboration. A deliberation allows multiple agents to discuss, provide responses, and vote on topics. Supports different deliberation types: voting (for decision-making), feedback (for gathering opinions), qa (for questions and answers), and shared-list (for collaborative lists).`,
            Kind.Edit,
            {
                properties: {
                    deliberation_type: {
                        description:
                            "The type of deliberation: 'voting' for decision-making, 'feedback' for gathering opinions, 'qa' for questions and answers, 'shared-list' for collaborative lists",
                        type: 'string',
                        enum: ['voting', 'feedback', 'qa', 'shared-list'],
                    },
                    title: {
                        description:
                            'The title of the deliberation session',
                        type: 'string',
                    },
                    request_message: {
                        description:
                            'The request message describing what needs to be deliberated or discussed',
                        type: 'string',
                    },
                    creator_id: {
                        description:
                            'The unique identifier of the agent or user creating the deliberation',
                        type: 'string',
                    },
                    creator_name: {
                        description:
                            'The display name of the creator',
                        type: 'string',
                    },
                    participants: {
                        description:
                            'Optional list of participant IDs who should be involved in this deliberation',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    status: {
                        description:
                            "Optional initial status of the deliberation: 'draft', 'collecting-responses', 'voting', 'completed', or 'closed'",
                        type: 'string',
                        enum: ['draft', 'collecting-responses', 'voting', 'completed', 'closed'],
                    },
                },
                required: ['deliberation_type', 'title', 'request_message', 'creator_id', 'creator_name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: DeliberationCreateToolParams,
    ): string | null {
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be non-empty.";
        }

        if (!params.request_message || params.request_message.trim() === '') {
            return "The 'request_message' parameter must be non-empty.";
        }

        if (!params.creator_id || params.creator_id.trim() === '') {
            return "The 'creator_id' parameter must be non-empty.";
        }

        if (!params.creator_name || params.creator_name.trim() === '') {
            return "The 'creator_name' parameter must be non-empty.";
        }

        const validTypes: DeliberationType[] = ['voting', 'feedback', 'qa', 'shared-list'];
        if (!validTypes.includes(params.deliberation_type)) {
            return `Invalid deliberation_type. Must be one of: ${validTypes.join(', ')}`;
        }

        if (params.status) {
            const validStatuses: DeliberationStatus[] = ['draft', 'collecting-responses', 'voting', 'completed', 'closed'];
            if (!validStatuses.includes(params.status)) {
                return `Invalid status. Must be one of: ${validStatuses.join(', ')}`;
            }
        }

        return null;
    }

    protected createInvocation(
        params: DeliberationCreateToolParams,
    ): ToolInvocation<DeliberationCreateToolParams, ToolResult> {
        return new DeliberationCreateToolInvocation(params);
    }
}
