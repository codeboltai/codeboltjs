/**
 * Mail List Reservations Tool - Lists file reservations
 * Wraps the SDK's cbmail.listReservations() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import mailService from '../../modules/mail';

/**
 * Parameters for the MailListReservations tool
 */
export interface MailListReservationsToolParams {
    /**
     * Filter by agent ID
     */
    agentId?: string;

    /**
     * Filter by file path
     */
    file?: string;
}

class MailListReservationsToolInvocation extends BaseToolInvocation<
    MailListReservationsToolParams,
    ToolResult
> {
    constructor(params: MailListReservationsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await mailService.listReservations(this.params);

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully listed reservations',
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
 * Implementation of the MailListReservations tool
 */
export class MailListReservationsTool extends BaseDeclarativeTool<
    MailListReservationsToolParams,
    ToolResult
> {
    static readonly Name: string = 'mail_list_reservations';

    constructor() {
        super(
            MailListReservationsTool.Name,
            'MailListReservations',
            'Lists file reservations with optional filters for agent and file.',
            Kind.Read,
            {
                properties: {
                    agentId: {
                        description: 'Filter by agent ID',
                        type: 'string',
                    },
                    file: {
                        description: 'Filter by file path',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: MailListReservationsToolParams,
    ): ToolInvocation<MailListReservationsToolParams, ToolResult> {
        return new MailListReservationsToolInvocation(params);
    }
}
