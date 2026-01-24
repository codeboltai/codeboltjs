/**
 * Deliberation List Tool
 * 
 * Lists deliberations with optional filtering.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';
import type { DeliberationType, DeliberationStatus } from '../../types/agentDeliberation';

/**
 * Parameters for listing deliberations
 */
export interface DeliberationListParams {
    /** Optional filter by deliberation type */
    deliberationType?: DeliberationType;
    /** Optional filter by status */
    status?: DeliberationStatus;
    /** Optional filter by participant ID */
    participant?: string;
    /** Optional search query */
    search?: string;
    /** Optional limit for results */
    limit?: number;
    /** Optional offset for pagination */
    offset?: number;
}

class DeliberationListInvocation extends BaseToolInvocation<DeliberationListParams, ToolResult> {
    constructor(params: DeliberationListParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.list(this.params);

            const { deliberations, total } = response.payload || { deliberations: [], total: 0 };

            if (deliberations.length === 0) {
                return {
                    llmContent: 'No deliberations found matching the criteria',
                    returnDisplay: 'No deliberations found',
                };
            }

            let content = `Found ${total} deliberation(s):\n\n`;
            deliberations.forEach(d => {
                content += `- ${d.title} (${d.id})\n`;
                content += `  Type: ${d.type}, Status: ${d.status}\n`;
                content += `  Responses: ${d.responseCount}, Votes: ${d.voteCount}\n`;
            });

            return {
                llmContent: content,
                returnDisplay: `Found ${total} deliberation(s)`,
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
 * Tool for listing deliberations with optional filtering
 */
export class DeliberationListTool extends BaseDeclarativeTool<DeliberationListParams, ToolResult> {
    constructor() {
        super(
            'deliberation_list',
            'List Deliberations',
            'Lists deliberations with optional filtering by type, status, participant, or search query.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    deliberationType: {
                        type: 'string',
                        enum: ['voting', 'feedback', 'qa', 'shared-list'],
                        description: 'Optional filter by deliberation type',
                    },
                    status: {
                        type: 'string',
                        enum: ['draft', 'collecting-responses', 'voting', 'completed', 'closed'],
                        description: 'Optional filter by status',
                    },
                    participant: {
                        type: 'string',
                        description: 'Optional filter by participant ID',
                    },
                    search: {
                        type: 'string',
                        description: 'Optional search query',
                    },
                    limit: {
                        type: 'number',
                        description: 'Optional limit for results',
                    },
                    offset: {
                        type: 'number',
                        description: 'Optional offset for pagination',
                    },
                },
            }
        );
    }

    protected override createInvocation(params: DeliberationListParams): ToolInvocation<DeliberationListParams, ToolResult> {
        return new DeliberationListInvocation(params);
    }
}
