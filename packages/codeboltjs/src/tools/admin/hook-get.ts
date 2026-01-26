/**
 * Hook Get Tool - Gets a hook by ID
 * Wraps the SDK's hook.get() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

/**
 * Parameters for the HookGet tool
 */
export interface HookGetToolParams {
    /**
     * The ID of the hook to retrieve
     */
    hook_id: string;
}

class HookGetToolInvocation extends BaseToolInvocation<
    HookGetToolParams,
    ToolResult
> {
    constructor(params: HookGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await hook.get(this.params.hook_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error getting hook: ${errorMsg}`,
                    returnDisplay: `Error getting hook: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const hookData = response.data;

            if (!hookData) {
                return {
                    llmContent: `Hook with ID "${this.params.hook_id}" not found.`,
                    returnDisplay: `Hook not found`,
                    error: {
                        message: `Hook with ID "${this.params.hook_id}" not found`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const llmContent = `Hook Details:
- ID: ${hookData.id}
- Name: ${hookData.name}
- Description: ${hookData.description || 'N/A'}
- Trigger: ${hookData.trigger}
- Trigger Config: ${hookData.triggerConfig ? JSON.stringify(hookData.triggerConfig, null, 2) : 'N/A'}
- Action: ${hookData.action}
- Action Config: ${hookData.actionConfig ? JSON.stringify(hookData.actionConfig, null, 2) : 'N/A'}
- Enabled: ${hookData.enabled}
- Priority: ${hookData.priority ?? 'N/A'}
- Created At: ${hookData.createdAt}
- Updated At: ${hookData.updatedAt}
- Last Triggered At: ${hookData.lastTriggeredAt || 'Never'}
- Trigger Count: ${hookData.triggerCount}`;

            return {
                llmContent,
                returnDisplay: `Successfully retrieved hook "${hookData.name}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting hook: ${errorMessage}`,
                returnDisplay: `Error getting hook: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the HookGet tool logic
 */
export class HookGetTool extends BaseDeclarativeTool<
    HookGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'hook_get';

    constructor() {
        super(
            HookGetTool.Name,
            'HookGet',
            `Gets detailed information about a specific hook by its ID. Returns the hook's configuration, status, and statistics.`,
            Kind.Read,
            {
                properties: {
                    hook_id: {
                        description: 'The unique identifier of the hook to retrieve',
                        type: 'string',
                    },
                },
                required: ['hook_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: HookGetToolParams,
    ): string | null {
        if (!params.hook_id || params.hook_id.trim() === '') {
            return "The 'hook_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: HookGetToolParams,
    ): ToolInvocation<HookGetToolParams, ToolResult> {
        return new HookGetToolInvocation(params);
    }
}
