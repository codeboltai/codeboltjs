/**
 * Debug Add Log Tool - Adds a debug log entry
 * Wraps the SDK's debug.debug() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import debug, { logType } from '../../modules/debug';

export interface DebugAddLogParams {
    /** The log message to add */
    log: string;
    /** The type of log (info, error, warning) */
    type: 'info' | 'error' | 'warning';
}

class DebugAddLogInvocation extends BaseToolInvocation<DebugAddLogParams, ToolResult> {
    constructor(params: DebugAddLogParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const logTypeValue = logType[this.params.type as keyof typeof logType];
            const response = await debug.debug(this.params.log, logTypeValue);

            if (response && (response as any).error) {
                const errorMsg = typeof (response as any).error === 'string'
                    ? (response as any).error
                    : (response as any).error?.message || 'Debug log failed';
                return {
                    llmContent: `Debug log failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Debug log added successfully with type '${this.params.type}': ${this.params.log}`,
                returnDisplay: `Debug log added (${this.params.type}): ${this.params.log}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding debug log: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class DebugAddLogTool extends BaseDeclarativeTool<DebugAddLogParams, ToolResult> {
    static readonly Name: string = 'debug_add_log';

    constructor() {
        super(
            DebugAddLogTool.Name,
            'DebugAddLog',
            'Adds a debug log entry with a specified log type (info, error, or warning).',
            Kind.Edit,
            {
                properties: {
                    log: {
                        description: 'The log message to add.',
                        type: 'string',
                    },
                    type: {
                        description: 'The type of the log message.',
                        type: 'string',
                        enum: ['info', 'error', 'warning'],
                    },
                },
                required: ['log', 'type'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: DebugAddLogParams): string | null {
        if (!params.log || params.log.trim() === '') {
            return "'log' is required and cannot be empty";
        }
        if (!params.type) {
            return "'type' is required";
        }
        if (!['info', 'error', 'warning'].includes(params.type)) {
            return "'type' must be one of: info, error, warning";
        }
        return null;
    }

    protected createInvocation(params: DebugAddLogParams): ToolInvocation<DebugAddLogParams, ToolResult> {
        return new DebugAddLogInvocation(params);
    }
}
