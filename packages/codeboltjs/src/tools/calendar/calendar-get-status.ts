/**
 * Calendar Get Status Tool - Retrieves the calendar scheduler status
 * Wraps the SDK's cbcalendar.getStatus() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcalendar from '../../modules/calendar';

/**
 * Parameters for the CalendarGetStatus tool (no parameters required)
 */
export interface CalendarGetStatusToolParams {
    // No parameters needed
}

class CalendarGetStatusToolInvocation extends BaseToolInvocation<
    CalendarGetStatusToolParams,
    ToolResult
> {
    constructor(params: CalendarGetStatusToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbcalendar.getStatus();

            if (!response.success) {
                const errorMsg = response.error?.message || response.message || 'Unknown error';
                return {
                    llmContent: `Error retrieving calendar status: ${errorMsg}`,
                    returnDisplay: `Error retrieving calendar status: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const status = response.data;

            if (!status) {
                return {
                    llmContent: 'Calendar status information is not available.',
                    returnDisplay: 'Calendar status unavailable',
                    error: {
                        message: 'Status information not available',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const statusInfo = {
                isRunning: status.isRunning,
                lastCheck: status.lastCheck,
                nextCheck: status.nextCheck,
                scheduledEvents: status.scheduledEvents,
            };

            return {
                llmContent: `Calendar scheduler status:\n${JSON.stringify(statusInfo, null, 2)}`,
                returnDisplay: `Calendar status: ${status.isRunning ? 'Running' : 'Stopped'} | ${status.scheduledEvents} scheduled events`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving calendar status: ${errorMessage}`,
                returnDisplay: `Error retrieving calendar status: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CalendarGetStatus tool
 */
export class CalendarGetStatusTool extends BaseDeclarativeTool<
    CalendarGetStatusToolParams,
    ToolResult
> {
    static readonly Name: string = 'calendar_get_status';

    constructor() {
        super(
            CalendarGetStatusTool.Name,
            'CalendarGetStatus',
            `Retrieves the current status of the calendar scheduler. Returns information about whether the scheduler is running, the last and next check times, and the number of scheduled events.`,
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: CalendarGetStatusToolParams,
    ): ToolInvocation<CalendarGetStatusToolParams, ToolResult> {
        return new CalendarGetStatusToolInvocation(params);
    }
}
