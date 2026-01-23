/**
 * Capability List Skills Tool - Lists all available skills
 * Wraps the SDK's codeboltCapability.listSkills() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCapability from '../../modules/capability';

/**
 * Parameters for the CapabilityListSkills tool
 */
export interface CapabilityListSkillsToolParams {
    /**
     * Optional filter by tags
     */
    tags?: string[];

    /**
     * Optional filter by author
     */
    author?: string;
}

class CapabilityListSkillsToolInvocation extends BaseToolInvocation<
    CapabilityListSkillsToolParams,
    ToolResult
> {
    constructor(params: CapabilityListSkillsToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCapability.listSkills();

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to list skills';
                return {
                    llmContent: `Error listing skills: ${errorMsg}`,
                    returnDisplay: `Error listing skills: ${errorMsg}`,
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
                returnDisplay: `Successfully listed ${capabilities.length} skills`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing skills: ${errorMessage}`,
                returnDisplay: `Error listing skills: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CapabilityListSkills tool
 */
export class CapabilityListSkillsTool extends BaseDeclarativeTool<
    CapabilityListSkillsToolParams,
    ToolResult
> {
    static readonly Name: string = 'capability_list_skills';

    constructor() {
        super(
            CapabilityListSkillsTool.Name,
            'CapabilityListSkills',
            `Lists all available skills with optional filtering by tags or author. Skills are a type of capability that can be executed. Returns metadata about each skill including name, description, and configuration.`,
            Kind.Read,
            {
                properties: {
                    tags: {
                        description:
                            'Optional: Filter by tags. Only skills with matching tags will be returned.',
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
        params: CapabilityListSkillsToolParams,
    ): ToolInvocation<CapabilityListSkillsToolParams, ToolResult> {
        return new CapabilityListSkillsToolInvocation(params);
    }
}
