/**
 * Capability Get Status Tool - Gets the status of a capability execution
 * Wraps the SDK's codeboltCapability.getExecutionStatus() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCapability from '../../modules/capability';

/**
 * Parameters for the CapabilityGetStatus tool
 */
export interface CapabilityGetStatusToolParams {
    /**
     * The execution ID to get status for
     */
    executionId: string;
}

class CapabilityGetStatusToolInvocation extends BaseToolInvocation<
    CapabilityGetStatusToolParams,
    ToolResult
> {
    constructor(params: CapabilityGetStatusToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCapability.getExecutionStatus(
                this.params.executionId
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to get execution status';
                return {
                    llmContent: `Error getting execution status: ${errorMsg}`,
                    returnDisplay: `Error getting execution status: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const execution = response.execution;
            const result = {
                executionId: this.params.executionId,
                execution: execution,
                error: response.error,
            };
            const llmContent = JSON.stringify(result, null, 2);

            const statusDisplay = execution?.status || 'unknown';
            return {
                llmContent,
                returnDisplay: `Execution ${this.params.executionId} status: ${statusDisplay}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting execution status: ${errorMessage}`,
                returnDisplay: `Error getting execution status: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CapabilityGetStatus tool
 */
export class CapabilityGetStatusTool extends BaseDeclarativeTool<
    CapabilityGetStatusToolParams,
    ToolResult
> {
    static readonly Name: string = 'capability_get_status';

    constructor() {
        super(
            CapabilityGetStatusTool.Name,
            'CapabilityGetStatus',
            `Gets the current status of a capability execution. Use the execution ID returned from capability_start or capability_start_skill to check if a capability is still running, completed, or failed.`,
            Kind.Read,
            {
                properties: {
                    executionId: {
                        description:
                            'The execution ID to get status for (returned from capability_start or capability_start_skill).',
                        type: 'string',
                    },
                },
                required: ['executionId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CapabilityGetStatusToolParams,
    ): string | null {
        if (!params.executionId || params.executionId.trim() === '') {
            return "The 'executionId' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: CapabilityGetStatusToolParams,
    ): ToolInvocation<CapabilityGetStatusToolParams, ToolResult> {
        return new CapabilityGetStatusToolInvocation(params);
    }
}
