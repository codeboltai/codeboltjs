/**
 * Capability Start Tool - Starts a capability execution
 * Wraps the SDK's codeboltCapability.startCapability() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCapability from '../../modules/capability';

/**
 * Parameters for the CapabilityStart tool
 */
export interface CapabilityStartToolParams {
    /**
     * The name of the capability to start
     */
    capabilityId: string;

    /**
     * The type of the capability (skill, power, talent)
     */
    capabilityType: string;

    /**
     * Optional parameters to pass to the capability
     */
    params?: Record<string, any>;

    /**
     * Optional execution timeout in milliseconds
     */
    timeout?: number;
}

class CapabilityStartToolInvocation extends BaseToolInvocation<
    CapabilityStartToolParams,
    ToolResult
> {
    constructor(params: CapabilityStartToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCapability.startCapability(
                this.params.capabilityId,
                this.params.capabilityType as any,
                this.params.params,
                this.params.timeout
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to start capability';
                return {
                    llmContent: `Error starting capability: ${errorMsg}`,
                    returnDisplay: `Error starting capability: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const result = {
                executionId: response.executionId,
                success: response.success,
            };
            const llmContent = JSON.stringify(result, null, 2);

            return {
                llmContent,
                returnDisplay: `Successfully started capability: ${this.params.capabilityId}${response.executionId ? ` (execution ID: ${response.executionId})` : ''}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error starting capability: ${errorMessage}`,
                returnDisplay: `Error starting capability: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CapabilityStart tool
 */
export class CapabilityStartTool extends BaseDeclarativeTool<
    CapabilityStartToolParams,
    ToolResult
> {
    static readonly Name: string = 'capability_start';

    constructor() {
        super(
            CapabilityStartTool.Name,
            'CapabilityStart',
            `Starts a capability execution. Capabilities can be skills, powers, or talents. Pass the capability name, type, and optional parameters. Returns an execution ID that can be used to track status or stop the capability.`,
            Kind.Execute,
            {
                properties: {
                    capabilityId: {
                        description:
                            'The name/identifier of the capability to start.',
                        type: 'string',
                    },
                    capabilityType: {
                        description:
                            "The type of the capability: 'skill', 'power', or 'talent'.",
                        type: 'string',
                    },
                    params: {
                        description:
                            'Optional: Parameters to pass to the capability as a key-value object.',
                        type: 'object',
                        additionalProperties: true,
                    },
                    timeout: {
                        description:
                            'Optional: Execution timeout in milliseconds.',
                        type: 'number',
                    },
                },
                required: ['capabilityId', 'capabilityType'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CapabilityStartToolParams,
    ): string | null {
        if (!params.capabilityId || params.capabilityId.trim() === '') {
            return "The 'capabilityId' parameter must be non-empty.";
        }
        if (!params.capabilityType || params.capabilityType.trim() === '') {
            return "The 'capabilityType' parameter must be non-empty.";
        }
        const validTypes = ['skill', 'power', 'talent'];
        if (!validTypes.includes(params.capabilityType.toLowerCase())) {
            return `The 'capabilityType' must be one of: ${validTypes.join(', ')}`;
        }
        if (params.timeout !== undefined && params.timeout <= 0) {
            return 'Timeout must be a positive number';
        }
        return null;
    }

    protected createInvocation(
        params: CapabilityStartToolParams,
    ): ToolInvocation<CapabilityStartToolParams, ToolResult> {
        return new CapabilityStartToolInvocation(params);
    }
}
