/**
 * Deliberation Get Tool
 * 
 * Retrieves a deliberation by ID with optional view filtering.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';

/**
 * Parameters for getting a deliberation
 */
export interface DeliberationGetParams {
    /** The ID of the deliberation to retrieve */
    id: string;
    /** Optional view filter (request, full, responses, votes, winner) */
    view?: 'request' | 'full' | 'responses' | 'votes' | 'winner';
}

class DeliberationGetInvocation extends BaseToolInvocation<DeliberationGetParams, ToolResult> {
    constructor(params: DeliberationGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.get(this.params);

            const { deliberation, responses, votes, winner } = response.payload || {};

            if (!deliberation && !responses && !votes && !winner) {
                return {
                    llmContent: `Error: Deliberation with ID "${this.params.id}" not found`,
                    returnDisplay: 'Error: Deliberation not found',
                    error: {
                        message: 'Deliberation not found',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let content = '';
            if (deliberation) {
                content += `Deliberation: ${deliberation.title} (${deliberation.status})\n`;
                content += `Type: ${deliberation.type}\n`;
                content += `Responses: ${deliberation.responseCount}, Votes: ${deliberation.voteCount}\n`;
            }
            if (responses && responses.length > 0) {
                content += `\nResponses (${responses.length}):\n`;
                responses.forEach(r => content += `- ${r.responderName}: ${r.body.substring(0, 100)}...\n`);
            }
            if (votes && votes.length > 0) {
                content += `\nVotes: ${votes.length}\n`;
            }
            if (winner) {
                content += `\nWinner: ${winner.responderName}\n`;
            }

            return {
                llmContent: content,
                returnDisplay: `Retrieved deliberation: ${deliberation?.title || this.params.id}`,
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
 * Tool for retrieving a deliberation by ID
 */
export class DeliberationGetTool extends BaseDeclarativeTool<DeliberationGetParams, ToolResult> {
    constructor() {
        super(
            'deliberation_get',
            'Get Deliberation',
            'Retrieves a deliberation by ID with optional view filtering (request, full, responses, votes, winner).',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'The ID of the deliberation to retrieve',
                    },
                    view: {
                        type: 'string',
                        enum: ['request', 'full', 'responses', 'votes', 'winner'],
                        description: 'Optional view filter',
                    },
                },
                required: ['id'],
            }
        );
    }

    protected override createInvocation(params: DeliberationGetParams): ToolInvocation<DeliberationGetParams, ToolResult> {
        return new DeliberationGetInvocation(params);
    }
}
