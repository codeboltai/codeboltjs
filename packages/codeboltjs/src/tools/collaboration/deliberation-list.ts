/**
 * Deliberation List Tool - Lists all deliberations
 * Wraps the SDK's cbagentDeliberation.list() method
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
 * Parameters for the DeliberationList tool
 */
export interface DeliberationListToolParams {
    /**
     * Optional filter by deliberation type
     */
    deliberation_type?: DeliberationType;

    /**
     * Optional filter by status
     */
    status?: DeliberationStatus;

    /**
     * Optional filter by participant ID
     */
    participant?: string;

    /**
     * Optional search term to filter deliberations
     */
    search?: string;

    /**
     * Optional limit for the number of results
     */
    limit?: number;

    /**
     * Optional offset for pagination
     */
    offset?: number;
}

class DeliberationListToolInvocation extends BaseToolInvocation<
    DeliberationListToolParams,
    ToolResult
> {
    constructor(params: DeliberationListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.list({
                deliberationType: this.params.deliberation_type,
                status: this.params.status,
                participant: this.params.participant,
                search: this.params.search,
                limit: this.params.limit,
                offset: this.params.offset,
            });

            const { deliberations, total } = response.payload || { deliberations: [], total: 0 };

            if (!deliberations || deliberations.length === 0) {
                return {
                    llmContent: 'No deliberations found matching the specified criteria.',
                    returnDisplay: 'No deliberations found',
                };
            }

            const resultContent = JSON.stringify({ deliberations, total }, null, 2);

            return {
                llmContent: `Found ${total} deliberation(s):\n${resultContent}`,
                returnDisplay: `Successfully listed ${deliberations.length} deliberation(s) (total: ${total})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing deliberations: ${errorMessage}`,
                returnDisplay: `Error listing deliberations: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the DeliberationList tool logic
 */
export class DeliberationListTool extends BaseDeclarativeTool<
    DeliberationListToolParams,
    ToolResult
> {
    static readonly Name: string = 'deliberation_list';

    constructor() {
        super(
            DeliberationListTool.Name,
            'DeliberationList',
            `Lists all deliberations with optional filtering. Can filter by deliberation type, status, participant, or search term. Supports pagination with limit and offset parameters. Use this to discover ongoing or past deliberations.`,
            Kind.Read,
            {
                properties: {
                    deliberation_type: {
                        description:
                            "Optional filter by deliberation type: 'voting', 'feedback', 'qa', or 'shared-list'",
                        type: 'string',
                        enum: ['voting', 'feedback', 'qa', 'shared-list'],
                    },
                    status: {
                        description:
                            "Optional filter by status: 'draft', 'collecting-responses', 'voting', 'completed', or 'closed'",
                        type: 'string',
                        enum: ['draft', 'collecting-responses', 'voting', 'completed', 'closed'],
                    },
                    participant: {
                        description:
                            'Optional filter by participant ID to find deliberations a specific agent is involved in',
                        type: 'string',
                    },
                    search: {
                        description:
                            'Optional search term to filter deliberations by title or content',
                        type: 'string',
                    },
                    limit: {
                        description:
                            'Optional maximum number of results to return (for pagination)',
                        type: 'number',
                    },
                    offset: {
                        description:
                            'Optional offset for pagination (number of results to skip)',
                        type: 'number',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: DeliberationListToolParams,
    ): string | null {
        if (params.deliberation_type) {
            const validTypes: DeliberationType[] = ['voting', 'feedback', 'qa', 'shared-list'];
            if (!validTypes.includes(params.deliberation_type)) {
                return `Invalid deliberation_type. Must be one of: ${validTypes.join(', ')}`;
            }
        }

        if (params.status) {
            const validStatuses: DeliberationStatus[] = ['draft', 'collecting-responses', 'voting', 'completed', 'closed'];
            if (!validStatuses.includes(params.status)) {
                return `Invalid status. Must be one of: ${validStatuses.join(', ')}`;
            }
        }

        if (params.limit !== undefined && params.limit <= 0) {
            return 'Limit must be a positive number';
        }

        if (params.offset !== undefined && params.offset < 0) {
            return 'Offset must be a non-negative number';
        }

        return null;
    }

    protected createInvocation(
        params: DeliberationListToolParams,
    ): ToolInvocation<DeliberationListToolParams, ToolResult> {
        return new DeliberationListToolInvocation(params);
    }
}
