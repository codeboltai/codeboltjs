/**
 * Capability List Tool - Lists all available capabilities with optional filtering
 * Wraps the SDK's codeboltCapability.listCapabilities() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCapability from '../../modules/capability';

/**
 * Parameters for the CapabilityList tool
 */
export interface CapabilityListToolParams {
    /**
     * Optional filter by capability type (skill, power, talent, etc.)
     */
    type?: string;

    /**
     * Optional filter by tags
     */
    tags?: string[];

    /**
     * Optional filter by author
     */
    author?: string;
}

class CapabilityListToolInvocation extends BaseToolInvocation<
    CapabilityListToolParams,
    ToolResult
> {
    constructor(params: CapabilityListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filter: any = {};
            if (this.params.type) {
                filter.type = this.params.type;
            }
            if (this.params.tags && this.params.tags.length > 0) {
                filter.tags = this.params.tags;
            }
            if (this.params.author) {
                filter.author = this.params.author;
            }

            const response = await codeboltCapability.listCapabilities(
                Object.keys(filter).length > 0 ? filter : undefined
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to list capabilities';
                return {
                    llmContent: `Error listing capabilities: ${errorMsg}`,
                    returnDisplay: `Error listing capabilities: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const capabilities = response.capabilities || [];
            const llmContent = JSON.stringify(capabilities, null, 2);

            return {
                llmContent,
                returnDisplay: `Successfully listed ${capabilities.length} capabilities`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing capabilities: ${errorMessage}`,
                returnDisplay: `Error listing capabilities: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CapabilityList tool
 */
export class CapabilityListTool extends BaseDeclarativeTool<
    CapabilityListToolParams,
    ToolResult
> {
    static readonly Name: string = 'capability_list';

    constructor() {
        super(
            CapabilityListTool.Name,
            'CapabilityList',
            `Lists all available capabilities (skills, powers, talents) with optional filtering by type, tags, or author. Returns metadata about each capability including name, description, and configuration.`,
            Kind.Read,
            {
                properties: {
                    type: {
                        description:
                            "Optional: Filter by capability type (e.g., 'skill', 'power', 'talent')",
                        type: 'string',
                    },
                    tags: {
                        description:
                            'Optional: Filter by tags. Only capabilities with matching tags will be returned.',
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
        params: CapabilityListToolParams,
    ): ToolInvocation<CapabilityListToolParams, ToolResult> {
        return new CapabilityListToolInvocation(params);
    }
}
