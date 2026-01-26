/**
 * Deliberation Summary Tool
 * 
 * Adds or updates a summary for a deliberation.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbagentDeliberation from '../../modules/agentDeliberation';

/**
 * Parameters for adding a summary to a deliberation
 */
export interface DeliberationSummaryParams {
    /** The ID of the deliberation */
    deliberationId: string;
    /** The summary text */
    summary: string;
    /** The ID of the summary author */
    authorId: string;
    /** The name of the summary author */
    authorName: string;
}

class DeliberationSummaryInvocation extends BaseToolInvocation<DeliberationSummaryParams, ToolResult> {
    constructor(params: DeliberationSummaryParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbagentDeliberation.summary(this.params);

            const deliberation = response.payload?.deliberation;

            if (!deliberation) {
                return {
                    llmContent: 'Error: Failed to add summary',
                    returnDisplay: 'Error: Failed to add summary',
                    error: {
                        message: 'No deliberation returned from summary operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully added summary to deliberation "${deliberation.title}"\nSummary by: ${deliberation.summaryAuthorName}`,
                returnDisplay: `Added summary to ${deliberation.title}`,
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
 * Tool for adding a summary to a deliberation
 */
export class DeliberationSummaryTool extends BaseDeclarativeTool<DeliberationSummaryParams, ToolResult> {
    constructor() {
        super(
            'deliberation_summary',
            'Add Deliberation Summary',
            'Adds or updates a summary for a deliberation, typically after responses and voting are complete.',
            Kind.Edit,
            {
                type: 'object',
                properties: {
                    deliberationId: {
                        type: 'string',
                        description: 'The ID of the deliberation',
                    },
                    summary: {
                        type: 'string',
                        description: 'The summary text',
                    },
                    authorId: {
                        type: 'string',
                        description: 'The ID of the summary author',
                    },
                    authorName: {
                        type: 'string',
                        description: 'The name of the summary author',
                    },
                },
                required: ['deliberationId', 'summary', 'authorId', 'authorName'],
            }
        );
    }

    protected override createInvocation(params: DeliberationSummaryParams): ToolInvocation<DeliberationSummaryParams, ToolResult> {
        return new DeliberationSummaryInvocation(params);
    }
}
