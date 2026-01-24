/**
 * Deliberation Vote Tool
 * 
 * Casts a vote for a response in a deliberation.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';

/**
 * Parameters for voting on a deliberation response
 */
export interface DeliberationVoteParams {
    /** The ID of the deliberation */
    deliberationId: string;
    /** The ID of the response to vote for */
    responseId: string;
    /** The ID of the voter */
    voterId: string;
    /** The name of the voter */
    voterName: string;
}

class DeliberationVoteInvocation extends BaseToolInvocation<DeliberationVoteParams, ToolResult> {
    constructor(params: DeliberationVoteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.vote(this.params);

            const vote = response.payload?.vote;

            if (!vote) {
                return {
                    llmContent: 'Error: Failed to cast vote',
                    returnDisplay: 'Error: Failed to cast vote',
                    error: {
                        message: 'No vote returned from vote operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully cast vote from ${vote.voterName}\nVote ID: ${vote.id}`,
                returnDisplay: `Vote cast by ${vote.voterName}`,
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
 * Tool for voting on a deliberation response
 */
export class DeliberationVoteTool extends BaseDeclarativeTool<DeliberationVoteParams, ToolResult> {
    constructor() {
        super(
            'deliberation_vote',
            'Vote on Deliberation',
            'Casts a vote for a response in a deliberation.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    deliberationId: {
                        type: 'string',
                        description: 'The ID of the deliberation',
                    },
                    responseId: {
                        type: 'string',
                        description: 'The ID of the response to vote for',
                    },
                    voterId: {
                        type: 'string',
                        description: 'The ID of the voter',
                    },
                    voterName: {
                        type: 'string',
                        description: 'The name of the voter',
                    },
                },
                required: ['deliberationId', 'responseId', 'voterId', 'voterName'],
            }
        );
    }

    protected override createInvocation(params: DeliberationVoteParams): ToolInvocation<DeliberationVoteParams, ToolResult> {
        return new DeliberationVoteInvocation(params);
    }
}
