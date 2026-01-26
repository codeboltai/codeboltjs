/**
 * Capability Stop Tool - Stops a running capability execution
 * Wraps the SDK's codeboltCapability.stopCapability() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCapability from '../../modules/capability';

/**
 * Parameters for the CapabilityStop tool
 */
export interface CapabilityStopToolParams {
    /**
     * The execution ID of the capability to stop
     */
    capabilityId: string;
}

class CapabilityStopToolInvocation extends BaseToolInvocation<
    CapabilityStopToolParams,
    ToolResult
> {
    constructor(params: CapabilityStopToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCapability.stopCapability(
                this.params.capabilityId
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to stop capability';
                return {
                    llmContent: `Error stopping capability: ${errorMsg}`,
                    returnDisplay: `Error stopping capability: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const result = {
                success: response.success,
            };
            const llmContent = JSON.stringify(result, null, 2);

            return {
                llmContent,
                returnDisplay: `Successfully stopped capability execution: ${this.params.capabilityId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error stopping capability: ${errorMessage}`,
                returnDisplay: `Error stopping capability: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CapabilityStop tool
 */
export class CapabilityStopTool extends BaseDeclarativeTool<
    CapabilityStopToolParams,
    ToolResult
> {
    static readonly Name: string = 'capability_stop';

    constructor() {
        super(
            CapabilityStopTool.Name,
            'CapabilityStop',
            `Stops a running capability execution. Use the execution ID returned from capability_start or capability_start_skill to stop a running capability.`,
            Kind.Execute,
            {
                properties: {
                    capabilityId: {
                        description:
                            'The execution ID of the capability to stop (returned from capability_start or capability_start_skill).',
                        type: 'string',
                    },
                },
                required: ['capabilityId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CapabilityStopToolParams,
    ): string | null {
        if (!params.capabilityId || params.capabilityId.trim() === '') {
            return "The 'capabilityId' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: CapabilityStopToolParams,
    ): ToolInvocation<CapabilityStopToolParams, ToolResult> {
        return new CapabilityStopToolInvocation(params);
    }
}
