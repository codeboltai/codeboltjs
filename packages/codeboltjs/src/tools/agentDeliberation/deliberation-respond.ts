/**
 * Deliberation Respond Tool
 * 
 * Adds a response to a deliberation.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';

/**
 * Parameters for responding to a deliberation
 */
export interface DeliberationRespondParams {
    /** The ID of the deliberation */
    deliberationId: string;
    /** The ID of the responder */
    responderId: string;
    /** The name of the responder */
    responderName: string;
    /** The response body */
    body: string;
}

class DeliberationRespondInvocation extends BaseToolInvocation<DeliberationRespondParams, ToolResult> {
    constructor(params: DeliberationRespondParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.respond(this.params);

            const deliberationResponse = response.payload?.response;

            if (!deliberationResponse) {
                return {
                    llmContent: 'Error: Failed to add response',
                    returnDisplay: 'Error: Failed to add response',
                    error: {
                        message: 'No response returned from respond operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully added response from ${deliberationResponse.responderName}\nResponse ID: ${deliberationResponse.id}`,
                returnDisplay: `Added response from ${deliberationResponse.responderName}`,
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
 * Tool for responding to a deliberation
 */
export class DeliberationRespondTool extends BaseDeclarativeTool<DeliberationRespondParams, ToolResult> {
    constructor() {
        super(
            'deliberation_respond',
            'Respond to Deliberation',
            'Adds a response to a deliberation from an agent or user.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    deliberationId: {
                        type: 'string',
                        description: 'The ID of the deliberation',
                    },
                    responderId: {
                        type: 'string',
                        description: 'The ID of the responder',
                    },
                    responderName: {
                        type: 'string',
                        description: 'The name of the responder',
                    },
                    body: {
                        type: 'string',
                        description: 'The response body',
                    },
                },
                required: ['deliberationId', 'responderId', 'responderName', 'body'],
            }
        );
    }

    protected override createInvocation(params: DeliberationRespondParams): ToolInvocation<DeliberationRespondParams, ToolResult> {
        return new DeliberationRespondInvocation(params);
    }
}
