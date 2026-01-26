/**
 * Mail Reserve Files Tool - Reserves files for exclusive access
 * Wraps the SDK's cbmail.reserveFiles() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailReserveFiles tool
 */
export interface MailReserveFilesToolParams {
    /**
     * The agent ID requesting the reservation
     */
    agentId: string;

    /**
     * The file paths to reserve
     */
    files: string[];

    /**
     * The reason for reservation
     */
    reason?: string;

    /**
     * Duration of reservation in seconds
     */
    duration?: number;
}

class MailReserveFilesToolInvocation extends BaseToolInvocation<
    MailReserveFilesToolParams,
    ToolResult
> {
    constructor(params: MailReserveFilesToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            // Map files to paths for the SDK call
            const response = await mailService.reserveFiles({
                paths: this.params.files,
                agentId: this.params.agentId,
                reason: this.params.reason,
                duration: this.params.duration,
            } as any);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully reserved ${this.params.files.length} file(s)`,
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
 * Implementation of the MailReserveFiles tool
 */
export class MailReserveFilesTool extends BaseDeclarativeTool<
    MailReserveFilesToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_reserve_files';

    constructor() {
        super(
            MailReserveFilesTool.Name,
            'MailReserveFiles',
            'Reserves files for exclusive access by an agent.',
            Kind.Edit,
            {
                properties: {
                    agentId: {
                        description: 'The agent ID requesting the reservation',
                        type: 'string',
                    },
                    files: {
                        description: 'The file paths to reserve',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    reason: {
                        description: 'The reason for reservation',
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
        params: MailReserveFilesToolParams,
    ): ToolInvocation<MailReserveFilesToolParams, ToolResult> {
        return new MailReserveFilesToolInvocation(params);
    }
}
