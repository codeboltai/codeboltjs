/**
 * Capability Get Detail Tool - Gets detailed information about a specific capability
 * Wraps the SDK's codeboltCapability.getCapabilityDetail() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCapability from '../../modules/capability';

/**
 * Parameters for the CapabilityGetDetail tool
 */
export interface CapabilityGetDetailToolParams {
    /**
     * The name of the capability to get details for
     */
    capabilityId: string;

    /**
     * Optional: The type of the capability to narrow search
     */
    capabilityType?: string;
}

class CapabilityGetDetailToolInvocation extends BaseToolInvocation<
    CapabilityGetDetailToolParams,
    ToolResult
> {
    constructor(params: CapabilityGetDetailToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCapability.getCapabilityDetail(
                this.params.capabilityId,
                this.params.capabilityType as any
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to get capability details';
                return {
                    llmContent: `Error getting capability details: ${errorMsg}`,
                    returnDisplay: `Error getting capability details: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const capability = response.capability;
            const llmContent = JSON.stringify(capability, null, 2);

            return {
                llmContent,
                returnDisplay: `Successfully retrieved details for capability: ${this.params.capabilityId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting capability details: ${errorMessage}`,
                returnDisplay: `Error getting capability details: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CapabilityGetDetail tool
 */
export class CapabilityGetDetailTool extends BaseDeclarativeTool<
    CapabilityGetDetailToolParams,
    ToolResult
> {
    static readonly Name: string = 'capability_get_detail';

    constructor() {
        super(
            CapabilityGetDetailTool.Name,
            'CapabilityGetDetail',
            `Gets detailed information about a specific capability including its full configuration, parameters, description, and metadata. Use this to understand how to use a capability before starting it.`,
            Kind.Read,
            {
                properties: {
                    capabilityId: {
                        description:
                            'The name/identifier of the capability to get details for.',
                        type: 'string',
                    },
                    capabilityType: {
                        description:
                            "Optional: The type of the capability ('skill', 'power', 'talent') to narrow the search.",
                        type: 'string',
                    },
                },
                required: ['capabilityId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CapabilityGetDetailToolParams,
    ): string | null {
        if (!params.capabilityId || params.capabilityId.trim() === '') {
            return "The 'capabilityId' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: CapabilityGetDetailToolParams,
    ): ToolInvocation<CapabilityGetDetailToolParams, ToolResult> {
        return new CapabilityGetDetailToolInvocation(params);
    }
}
