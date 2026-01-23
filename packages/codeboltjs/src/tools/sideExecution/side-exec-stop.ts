/**
 * Side Execution Stop Tool - Stops a running side execution
 * Wraps the SDK's codeboltSideExecution.stop() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltSideExecution from '../../modules/sideExecution';

/**
 * Parameters for the SideExecutionStop tool
 */
export interface SideExecutionStopParams {
    /**
     * ID of the side execution to stop
     */
    side_execution_id: string;
}

class SideExecutionStopInvocation extends BaseToolInvocation<
    SideExecutionStopParams,
    ToolResult
> {
    constructor(params: SideExecutionStopParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltSideExecution.stop(
                this.params.side_execution_id
            );

            if ((response as any).error) {
                const errorMsg = (response as any).error || 'Failed to stop side execution';
                return {
                    llmContent: `Failed to stop side execution: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const success = (response as any).success !== false;

            if (success) {
                return {
                    llmContent: `Side execution stopped successfully.\nExecution ID: ${this.params.side_execution_id}`,
                    returnDisplay: `Side execution stopped: ${this.params.side_execution_id}`,
                };
            } else {
                return {
                    llmContent: `Failed to stop side execution: ${this.params.side_execution_id}`,
                    returnDisplay: `Failed to stop: ${this.params.side_execution_id}`,
                    error: {
                        message: 'Stop operation returned unsuccessful status',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error stopping side execution: ${errorMessage}`,
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
 * Tool for stopping a running side execution
 */
export class SideExecutionStopTool extends BaseDeclarativeTool<
    SideExecutionStopParams,
    ToolResult
> {
    static readonly Name: string = 'side_execution_stop';

    constructor() {
        super(
            SideExecutionStopTool.Name,
            'Stop Side Execution',
            'Stop a running side execution by its ID.',
            Kind.Execute,
            {
                type: 'object',
                properties: {
                    side_execution_id: {
                        type: 'string',
                        description: 'ID of the side execution to stop'
                    }
                },
                required: ['side_execution_id']
            }
        );
    }

    protected override validateToolParamValues(
        params: SideExecutionStopParams,
    ): string | null {
        if (!params.side_execution_id || params.side_execution_id.trim() === '') {
            return "The 'side_execution_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SideExecutionStopParams,
    ): ToolInvocation<SideExecutionStopParams, ToolResult> {
        return new SideExecutionStopInvocation(params);
    }
}
