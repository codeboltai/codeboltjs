/**
 * Deliberation Get Tool - Gets a deliberation by ID
 * Wraps the SDK's cbagentDeliberation.get() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';

/**
 * View options for getting a deliberation
 */
type DeliberationView = 'request' | 'full' | 'responses' | 'votes' | 'winner';

/**
 * Parameters for the DeliberationGet tool
 */
export interface DeliberationGetToolParams {
    /**
     * The unique identifier of the deliberation to retrieve
     */
    id: string;

    /**
     * Optional view to determine what data to include in the response
     */
    view?: DeliberationView;
}

class DeliberationGetToolInvocation extends BaseToolInvocation<
    DeliberationGetToolParams,
    ToolResult
> {
    constructor(params: DeliberationGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.get({
                id: this.params.id,
                view: this.params.view,
            });

            const { deliberation, responses, votes, winner } = response.payload || {};

            if (!deliberation && !responses && !votes && !winner) {
                return {
                    llmContent: `Error: Deliberation with ID "${this.params.id}" not found`,
                    returnDisplay: `Error: Deliberation not found`,
                    error: {
                        message: `Deliberation with ID "${this.params.id}" not found`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const resultContent = JSON.stringify(response.payload, null, 2);

            const viewDescription = this.params.view ? ` (view: ${this.params.view})` : '';
            return {
                llmContent: `Deliberation details${viewDescription}:\n${resultContent}`,
                returnDisplay: `Successfully retrieved deliberation "${deliberation?.title || this.params.id}"${viewDescription}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting deliberation: ${errorMessage}`,
                returnDisplay: `Error getting deliberation: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the DeliberationGet tool logic
 */
export class DeliberationGetTool extends BaseDeclarativeTool<
    DeliberationGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'deliberation_get';

    constructor() {
        super(
            DeliberationGetTool.Name,
            'DeliberationGet',
            `Retrieves a deliberation by its ID. Can return different views of the deliberation data: 'request' (basic info), 'full' (all data), 'responses' (with responses), 'votes' (with votes), or 'winner' (winning response). Use this to check the status of a deliberation or review responses and votes.`,
            Kind.Read,
            {
                properties: {
                    id: {
                        description:
                            'The unique identifier of the deliberation to retrieve',
                        type: 'string',
                    },
                    view: {
                        description:
                            "Optional view to determine what data to include: 'request' (basic info only), 'full' (all data), 'responses' (include responses), 'votes' (include votes), 'winner' (include winning response)",
                        type: 'string',
                        enum: ['request', 'full', 'responses', 'votes', 'winner'],
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: DeliberationGetToolParams,
    ): string | null {
        if (!params.id || params.id.trim() === '') {
            return "The 'id' parameter must be non-empty.";
        }

        if (params.view) {
            const validViews: DeliberationView[] = ['request', 'full', 'responses', 'votes', 'winner'];
            if (!validViews.includes(params.view)) {
                return `Invalid view. Must be one of: ${validViews.join(', ')}`;
            }
        }

        return null;
    }

    protected createInvocation(
        params: DeliberationGetToolParams,
    ): ToolInvocation<DeliberationGetToolParams, ToolResult> {
        return new DeliberationGetToolInvocation(params);
    }
}
