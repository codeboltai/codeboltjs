/**
 * Deliberation Update Tool
 * 
 * Updates a deliberation's status or request message.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';
import type { DeliberationStatus } from '../../types/agentDeliberation';

/**
 * Parameters for updating a deliberation
 */
export interface DeliberationUpdateParams {
    /** The ID of the deliberation to update */
    deliberationId: string;
    /** Optional new status */
    status?: DeliberationStatus;
    /** Optional new request message */
    requestMessage?: string;
}

class DeliberationUpdateInvocation extends BaseToolInvocation<DeliberationUpdateParams, ToolResult> {
    constructor(params: DeliberationUpdateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.update(this.params);

            const deliberation = response.payload?.deliberation;

            if (!deliberation) {
                return {
                    llmContent: 'Error: Failed to update deliberation',
                    returnDisplay: 'Error: Failed to update deliberation',
                    error: {
                        message: 'No deliberation returned from update operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated deliberation "${deliberation.title}"\nStatus: ${deliberation.status}`,
                returnDisplay: `Updated deliberation: ${deliberation.title}`,
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
 * Tool for updating a deliberation
 */
export class DeliberationUpdateTool extends BaseDeclarativeTool<DeliberationUpdateParams, ToolResult> {
    constructor() {
        super(
            'deliberation_update',
            'Update Deliberation',
            'Updates a deliberation\'s status or request message.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    deliberationId: {
                        type: 'string',
                        description: 'The ID of the deliberation to update',
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'collecting-responses', 'voting', 'completed', 'closed'],
                        description: 'Optional new status',
                    },
                    requestMessage: {
                        type: 'string',
                        description: 'Optional new request message',
                    },
                },
                required: ['deliberationId'],
            }
        );
    }

    protected override createInvocation(params: DeliberationUpdateParams): ToolInvocation<DeliberationUpdateParams, ToolResult> {
        return new DeliberationUpdateInvocation(params);
    }
}
