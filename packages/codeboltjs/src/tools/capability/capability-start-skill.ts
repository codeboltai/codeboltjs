/**
 * Capability Start Skill Tool - Starts a skill execution
 * Wraps the SDK's codeboltCapability.startSkill() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltCapability from '../../modules/capability';

/**
 * Parameters for the CapabilityStartSkill tool
 */
export interface CapabilityStartSkillToolParams {
    /**
     * The name of the skill to start
     */
    skillId: string;

    /**
     * Optional parameters to pass to the skill
     */
    params?: Record<string, any>;

    /**
     * Optional execution timeout in milliseconds
     */
    timeout?: number;
}

class CapabilityStartSkillToolInvocation extends BaseToolInvocation<
    CapabilityStartSkillToolParams,
    ToolResult
> {
    constructor(params: CapabilityStartSkillToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltCapability.startSkill(
                this.params.skillId,
                this.params.params,
                this.params.timeout
            );

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to start skill';
                return {
                    llmContent: `Error starting skill: ${errorMsg}`,
                    returnDisplay: `Error starting skill: ${errorMsg}`,
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
                returnDisplay: `Successfully started skill: ${this.params.skillId}${response.executionId ? ` (execution ID: ${response.executionId})` : ''}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error starting skill: ${errorMessage}`,
                returnDisplay: `Error starting skill: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the CapabilityStartSkill tool
 */
export class CapabilityStartSkillTool extends BaseDeclarativeTool<
    CapabilityStartSkillToolParams,
    ToolResult
> {
    static readonly Name: string = 'capability_start_skill';

    constructor() {
        super(
            CapabilityStartSkillTool.Name,
            'CapabilityStartSkill',
            `Starts a skill execution. Skills are capabilities that can be invoked with parameters. This is a convenience method specifically for skills. Returns an execution ID that can be used to track status or stop the skill.`,
            Kind.Execute,
            {
                properties: {
                    skillId: {
                        description:
                            'The name/identifier of the skill to start.',
                        type: 'string',
                    },
                    params: {
                        description:
                            'Optional: Parameters to pass to the skill as a key-value object.',
                        type: 'object',
                        additionalProperties: true,
                    },
                    timeout: {
                        description:
                            'Optional: Execution timeout in milliseconds.',
                        type: 'number',
                    },
                },
                required: ['skillId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: CapabilityStartSkillToolParams,
    ): string | null {
        if (!params.skillId || params.skillId.trim() === '') {
            return "The 'skillId' parameter must be non-empty.";
        }
        if (params.timeout !== undefined && params.timeout <= 0) {
            return 'Timeout must be a positive number';
        }
        return null;
    }

    protected createInvocation(
        params: CapabilityStartSkillToolParams,
    ): ToolInvocation<CapabilityStartSkillToolParams, ToolResult> {
        return new CapabilityStartSkillToolInvocation(params);
    }
}
