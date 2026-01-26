/**
 * Deliberation Respond Tool - Adds a response to a deliberation
 * Wraps the SDK's cbagentDeliberation.respond() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';

/**
 * Parameters for the DeliberationRespond tool
 */
export interface DeliberationRespondToolParams {
    /**
     * The unique identifier of the deliberation to respond to
     */
    deliberation_id: string;

    /**
     * The unique identifier of the responder
     */
    responder_id: string;

    /**
     * The display name of the responder
     */
    responder_name: string;

    /**
     * The response body/content
     */
    body: string;
}

class DeliberationRespondToolInvocation extends BaseToolInvocation<
    DeliberationRespondToolParams,
    ToolResult
> {
    constructor(params: DeliberationRespondToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.respond({
                deliberationId: this.params.deliberation_id,
                responderId: this.params.responder_id,
                responderName: this.params.responder_name,
                body: this.params.body,
            });

            const deliberationResponse = response.payload?.response;

            if (!deliberationResponse) {
                return {
                    llmContent: 'Error: Failed to add response - no response returned',
                    returnDisplay: 'Error: Failed to add response',
                    error: {
                        message: 'No response returned from respond operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resultContent = JSON.stringify(deliberationResponse, null, 2);

            return {
                llmContent: `Successfully added response to deliberation:\n${resultContent}`,
                returnDisplay: `Successfully added response by "${deliberationResponse.responderName}" (Response ID: ${deliberationResponse.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding response: ${errorMessage}`,
                returnDisplay: `Error adding response: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the DeliberationRespond tool logic
 */
export class DeliberationRespondTool extends BaseDeclarativeTool<
    DeliberationRespondToolParams,
    ToolResult
> {
    static readonly Name: string = 'deliberation_respond';

    constructor() {
        super(
            DeliberationRespondTool.Name,
            'DeliberationRespond',
            `Adds a response to an existing deliberation. Use this to contribute opinions, answers, or items (depending on the deliberation type) to a deliberation session. The response can then be voted on by other participants.`,
            Kind.Edit,
            {
                properties: {
                    deliberation_id: {
                        description:
                            'The unique identifier of the deliberation to respond to',
                        type: 'string',
                    },
                    responder_id: {
                        description:
                            'The unique identifier of the agent or user providing the response',
                        type: 'string',
                    },
                    responder_name: {
                        description:
                            'The display name of the responder',
                        type: 'string',
                    },
                    body: {
                        description:
                            'The content of the response. This could be an opinion, answer, item, or any relevant contribution to the deliberation',
                        type: 'string',
                    },
                },
                required: ['deliberation_id', 'responder_id', 'responder_name', 'body'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: DeliberationRespondToolParams,
    ): string | null {
        if (!params.deliberation_id || params.deliberation_id.trim() === '') {
            return "The 'deliberation_id' parameter must be non-empty.";
        }

        if (!params.responder_id || params.responder_id.trim() === '') {
            return "The 'responder_id' parameter must be non-empty.";
        }

        if (!params.responder_name || params.responder_name.trim() === '') {
            return "The 'responder_name' parameter must be non-empty.";
        }

        if (!params.body || params.body.trim() === '') {
            return "The 'body' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: DeliberationRespondToolParams,
    ): ToolInvocation<DeliberationRespondToolParams, ToolResult> {
        return new DeliberationRespondToolInvocation(params);
    }
}
