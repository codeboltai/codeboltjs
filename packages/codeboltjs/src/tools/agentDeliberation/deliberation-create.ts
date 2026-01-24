/**
 * Deliberation Create Tool
 * 
 * Creates a new deliberation session for agent collaboration and decision-making.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';
import type { DeliberationType, DeliberationStatus } from '../../types/agentDeliberation';

/**
 * Parameters for creating a deliberation
 */
export interface DeliberationCreateParams {
    /** The type of deliberation (voting, feedback, qa, shared-list) */
    deliberationType: DeliberationType;
    /** The title of the deliberation */
    title: string;
    /** The request message describing what needs to be deliberated */
    requestMessage: string;
    /** The ID of the creator */
    creatorId: string;
    /** The name of the creator */
    creatorName: string;
    /** Optional list of participant IDs */
    participants?: string[];
    /** Optional initial status of the deliberation */
    status?: DeliberationStatus;
}

class DeliberationCreateInvocation extends BaseToolInvocation<DeliberationCreateParams, ToolResult> {
    constructor(params: DeliberationCreateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.create(this.params);

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

            return {
                llmContent: `Successfully created deliberation "${deliberation.title}" (ID: ${deliberation.id})\nType: ${deliberation.type}\nStatus: ${deliberation.status}\nParticipants: ${deliberation.participants.length}`,
                returnDisplay: `Created deliberation: ${deliberation.title}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for creating a new deliberation session
 */
export class DeliberationCreateTool extends BaseDeclarativeTool<DeliberationCreateParams, ToolResult> {
    constructor() {
        super(
            'deliberation_create',
            'Create Deliberation',
            'Creates a new deliberation session for agent collaboration. Supports voting, feedback, Q&A, and shared-list types.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    deliberationType: {
                        type: 'string',
                        enum: ['voting', 'feedback', 'qa', 'shared-list'],
                        description: 'The type of deliberation',
                    },
                    title: {
                        type: 'string',
                        description: 'The title of the deliberation',
                    },
                    requestMessage: {
                        type: 'string',
                        description: 'The request message describing what needs to be deliberated',
                    },
                    creatorId: {
                        type: 'string',
                        description: 'The ID of the creator',
                    },
                    creatorName: {
                        type: 'string',
                        description: 'The name of the creator',
                    },
                    participants: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional list of participant IDs',
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'collecting-responses', 'voting', 'completed', 'closed'],
                        description: 'Optional initial status of the deliberation',
                    },
                },
                required: ['deliberationType', 'title', 'requestMessage', 'creatorId', 'creatorName'],
            }
        );
    }

    protected override createInvocation(params: DeliberationCreateParams): ToolInvocation<DeliberationCreateParams, ToolResult> {
        return new DeliberationCreateInvocation(params);
    }
}
