/**
 * Capability List Powers Tool - Lists all available powers
 * Wraps the SDK's codeboltCapability.listPowers() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCapability from '../../modules/capability';

/**
 * Parameters for the CapabilityListPowers tool
 */
export interface CapabilityListPowersToolParams {
    /**
     * Optional filter by tags
     */
    tags?: string[];

    /**
     * Optional filter by author
     */
    author?: string;
}

class CapabilityListPowersToolInvocation extends BaseToolInvocation<
    CapabilityListPowersToolParams,
    ToolResult
> {
    constructor(params: CapabilityListPowersToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCapability.listPowers();

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to list powers';
                return {
                    llmContent: `Error listing powers: ${errorMsg}`,
                    returnDisplay: `Error listing powers: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let capabilities = response.capabilities || [];

            // Apply optional filters
            if (this.params.tags && this.params.tags.length > 0) {
                capabilities = capabilities.filter((cap: any) =>
                    cap.tags && this.params.tags!.some(tag => cap.tags.includes(tag))
                );
            }
            if (this.params.author) {
                capabilities = capabilities.filter((cap: any) =>
                    cap.author === this.params.author
                );
            }

            const llmContent = JSON.stringify(capabilities, null, 2);

            return {
                llmContent,
                returnDisplay: `Successfully listed ${capabilities.length} powers`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing powers: ${errorMessage}`,
                returnDisplay: `Error listing powers: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CapabilityListPowers tool
 */
export class CapabilityListPowersTool extends BaseDeclarativeTool<
    CapabilityListPowersToolParams,
    ToolResult
> {
    static readonly Name: string = 'capability_list_powers';

    constructor() {
        super(
            CapabilityListPowersTool.Name,
            'CapabilityListPowers',
            `Lists all available powers with optional filtering by tags or author. Powers are a type of capability that provide enhanced functionality. Returns metadata about each power including name, description, and configuration.`,
            Kind.Read,
            {
                properties: {
                    tags: {
                        description:
                            'Optional: Filter by tags. Only powers with matching tags will be returned.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    author: {
                        description:
                            'Optional: Filter by author name.',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: CapabilityListPowersToolParams,
    ): ToolInvocation<CapabilityListPowersToolParams, ToolResult> {
        return new CapabilityListPowersToolInvocation(params);
    }
}
