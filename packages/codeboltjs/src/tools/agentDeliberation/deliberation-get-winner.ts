/**
 * Deliberation Get Winner Tool
 * 
 * Retrieves the winning response from a deliberation based on votes.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';

/**
 * Parameters for getting the winner of a deliberation
 */
export interface DeliberationGetWinnerParams {
    /** The ID of the deliberation */
    deliberationId: string;
}

class DeliberationGetWinnerInvocation extends BaseToolInvocation<DeliberationGetWinnerParams, ToolResult> {
    constructor(params: DeliberationGetWinnerParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.getWinner(this.params);

            const { winner, votes } = response.payload || {};

            if (!winner) {
                return {
                    llmContent: 'No winner determined yet. Either no votes have been cast or there is a tie.',
                    returnDisplay: 'No winner determined',
                };
            }

            return {
                llmContent: `Winner: ${winner.responderName}\nResponse: ${winner.body}\nVotes: ${winner.voteCount}\nTotal votes cast: ${votes?.length || 0}`,
                returnDisplay: `Winner: ${winner.responderName} (${winner.voteCount} votes)`,
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
 * Tool for getting the winner of a deliberation
 */
export class DeliberationGetWinnerTool extends BaseDeclarativeTool<DeliberationGetWinnerParams, ToolResult> {
    constructor() {
        super(
            'deliberation_get_winner',
            'Get Deliberation Winner',
            'Retrieves the winning response from a deliberation based on votes.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    deliberationId: {
                        type: 'string',
                        description: 'The ID of the deliberation',
                    },
                },
                required: ['deliberationId'],
            }
        );
    }

    protected override createInvocation(params: DeliberationGetWinnerParams): ToolInvocation<DeliberationGetWinnerParams, ToolResult> {
        return new DeliberationGetWinnerInvocation(params);
    }
}
