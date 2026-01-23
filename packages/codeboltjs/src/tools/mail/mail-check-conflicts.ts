/**
 * Mail Check Conflicts Tool - Checks for file reservation conflicts
 * Wraps the SDK's cbmail.checkConflicts() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailCheckConflicts tool
 */
export interface MailCheckConflictsToolParams {
    /**
     * The agent ID checking for conflicts
     */
    agentId: string;

    /**
     * The file paths to check for conflicts
     */
    files: string[];
}

class MailCheckConflictsToolInvocation extends BaseToolInvocation<
    MailCheckConflictsToolParams,
    ToolResult
> {
    constructor(params: MailCheckConflictsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.checkConflicts(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully checked for conflicts',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
 * Implementation of the MailCheckConflicts tool
 */
export class MailCheckConflictsTool extends BaseDeclarativeTool<
    MailCheckConflictsToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_check_conflicts';

    constructor() {
        super(
            MailCheckConflictsTool.Name,
            'MailCheckConflicts',
            'Checks if there are any conflicts for reserving specified files.',
            Kind.Read,
            {
                properties: {
                    agentId: {
                        description: 'The agent ID checking for conflicts',
                        type: 'string',
                    },
                    files: {
                        description: 'The file paths to check for conflicts',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['agentId', 'files'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailCheckConflictsToolParams,
    ): ToolInvocation<MailCheckConflictsToolParams, ToolResult> {
        return new MailCheckConflictsToolInvocation(params);
    }
}
