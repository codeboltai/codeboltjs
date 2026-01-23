/**
 * Mail Force Reserve Files Tool - Forcefully reserves files
 * Wraps the SDK's cbmail.forceReserveFiles() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailForceReserveFiles tool
 */
export interface MailForceReserveFilesToolParams {
    /**
     * The agent ID requesting the forced reservation
     */
    agentId: string;

    /**
     * The file paths to force reserve
     */
    files: string[];

    /**
     * The reason for forced reservation
     */
    reason?: string;

    /**
     * Duration of reservation in seconds
     */
    duration?: number;
}

class MailForceReserveFilesToolInvocation extends BaseToolInvocation<
    MailForceReserveFilesToolParams,
    ToolResult
> {
    constructor(params: MailForceReserveFilesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.forceReserveFiles(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully force reserved ${this.params.files.length} file(s)`,
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
 * Implementation of the MailForceReserveFiles tool
 */
export class MailForceReserveFilesTool extends BaseDeclarativeTool<
    MailForceReserveFilesToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_force_reserve_files';

    constructor() {
        super(
            MailForceReserveFilesTool.Name,
            'MailForceReserveFiles',
            'Forcefully reserves files, overriding existing reservations if necessary.',
            Kind.Edit,
            {
                properties: {
                    agentId: {
                        description: 'The agent ID requesting the forced reservation',
                        type: 'string',
                    },
                    files: {
                        description: 'The file paths to force reserve',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    reason: {
                        description: 'The reason for forced reservation',
                        type: 'string',
                    },
                    duration: {
                        description: 'Duration of reservation in seconds',
                        type: 'number',
                    },
                },
                required: ['agentId', 'files'],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailForceReserveFilesToolParams,
    ): ToolInvocation<MailForceReserveFilesToolParams, ToolResult> {
        return new MailForceReserveFilesToolInvocation(params);
    }
}
