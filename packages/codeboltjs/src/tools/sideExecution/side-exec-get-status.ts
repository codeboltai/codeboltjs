/**
 * Side Execution Get Status Tool - Gets the status of a side execution
 * Wraps the SDK's codeboltSideExecution.getStatus() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltSideExecution from '../../modules/sideExecution';

/**
 * Parameters for the SideExecutionGetStatus tool
 */
export interface SideExecutionGetStatusParams {
    /**
     * ID of the side execution
     */
    side_execution_id: string;
}

class SideExecutionGetStatusInvocation extends BaseToolInvocation<
    SideExecutionGetStatusParams,
    ToolResult
> {
    constructor(params: SideExecutionGetStatusParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltSideExecution.getStatus(
                this.params.side_execution_id
            );

            if ((response as any).error) {
                const errorMsg = (response as any).error || 'Failed to get side execution status';
                return {
                    llmContent: `Failed to get side execution status: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const status = (response as any).status || 'unknown';
            const result = (response as any).result;
            const startTime = (response as any).startTime;
            const endTime = (response as any).endTime;

            let llmContent = `Side Execution Status\n`;
            llmContent += `ID: ${this.params.side_execution_id}\n`;
            llmContent += `Status: ${status}\n`;

            if (startTime) {
                llmContent += `Start Time: ${startTime}\n`;
            }
            if (endTime) {
                llmContent += `End Time: ${endTime}\n`;
            }
            if (result !== undefined) {
                llmContent += `Result: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}\n`;
            }

            return {
                llmContent,
                returnDisplay: `Status: ${status}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting side execution status: ${errorMessage}`,
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
 * Tool for getting the status of a side execution
 */
export class SideExecutionGetStatusTool extends BaseDeclarativeTool<
    SideExecutionGetStatusParams,
    ToolResult
> {
    static readonly Name: string = 'side_execution_get_status';

    constructor() {
        super(
            SideExecutionGetStatusTool.Name,
            'Get Side Execution Status',
            'Get the status of a side execution by its ID.',
            Kind.Read,
            {
                type: 'object',
                properties: {
                    side_execution_id: {
                        type: 'string',
                        description: 'ID of the side execution'
                    }
                },
                required: ['side_execution_id']
            }
        );
    }

    protected override validateToolParamValues(
        params: SideExecutionGetStatusParams,
    ): string | null {
        if (!params.side_execution_id || params.side_execution_id.trim() === '') {
            return "The 'side_execution_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SideExecutionGetStatusParams,
    ): ToolInvocation<SideExecutionGetStatusParams, ToolResult> {
        return new SideExecutionGetStatusInvocation(params);
    }
}
