/**
 * Deliberation Vote Tool - Adds a vote to a deliberation
 * Wraps the SDK's cbagentDeliberation.vote() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';

/**
 * Parameters for the DeliberationVote tool
 */
export interface DeliberationVoteToolParams {
    /**
     * The unique identifier of the deliberation
     */
    deliberation_id: string;

    /**
     * The unique identifier of the response to vote for
     */
    response_id: string;

    /**
     * The unique identifier of the voter
     */
    voter_id: string;

    /**
     * The display name of the voter
     */
    voter_name: string;
}

class DeliberationVoteToolInvocation extends BaseToolInvocation<
    DeliberationVoteToolParams,
    ToolResult
> {
    constructor(params: DeliberationVoteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.vote({
                deliberationId: this.params.deliberation_id,
                responseId: this.params.response_id,
                voterId: this.params.voter_id,
                voterName: this.params.voter_name,
            });

            const vote = response.payload?.vote;

            if (!vote) {
                return {
                    llmContent: 'Error: Failed to add vote - no vote returned',
                    returnDisplay: 'Error: Failed to add vote',
                    error: {
                        message: 'No vote returned from vote operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resultContent = JSON.stringify(vote, null, 2);

            return {
                llmContent: `Successfully added vote to deliberation:\n${resultContent}`,
                returnDisplay: `Successfully voted by "${vote.voterName}" for response "${vote.responseId}" (Vote ID: ${vote.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding vote: ${errorMessage}`,
                returnDisplay: `Error adding vote: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the DeliberationVote tool logic
 */
export class DeliberationVoteTool extends BaseDeclarativeTool<
    DeliberationVoteToolParams,
    ToolResult
> {
    static readonly Name: string = 'deliberation_vote';

    constructor() {
        super(
            DeliberationVoteTool.Name,
            'DeliberationVote',
            `Adds a vote to a response in a deliberation. Use this to cast a vote for a specific response in a voting-type deliberation. Each voter can vote for responses they support or agree with.`,
            Kind.Edit,
            {
                properties: {
                    deliberation_id: {
                        description:
                            'The unique identifier of the deliberation',
                        type: 'string',
                    },
                    response_id: {
                        description:
                            'The unique identifier of the response to vote for',
                        type: 'string',
                    },
                    voter_id: {
                        description:
                            'The unique identifier of the agent or user casting the vote',
                        type: 'string',
                    },
                    voter_name: {
                        description:
                            'The display name of the voter',
                        type: 'string',
                    },
                },
                required: ['deliberation_id', 'response_id', 'voter_id', 'voter_name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: DeliberationVoteToolParams,
    ): string | null {
        if (!params.deliberation_id || params.deliberation_id.trim() === '') {
            return "The 'deliberation_id' parameter must be non-empty.";
        }

        if (!params.response_id || params.response_id.trim() === '') {
            return "The 'response_id' parameter must be non-empty.";
        }

        if (!params.voter_id || params.voter_id.trim() === '') {
            return "The 'voter_id' parameter must be non-empty.";
        }

        if (!params.voter_name || params.voter_name.trim() === '') {
            return "The 'voter_name' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: DeliberationVoteToolParams,
    ): ToolInvocation<DeliberationVoteToolParams, ToolResult> {
        return new DeliberationVoteToolInvocation(params);
    }
}
