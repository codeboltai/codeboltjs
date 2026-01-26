/**
 * Hook List Tool - Lists all hooks
 * Wraps the SDK's hook.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

/**
 * Parameters for the HookList tool
 */
export interface HookListToolParams {
    // No parameters required for listing hooks
}

class HookListToolInvocation extends BaseToolInvocation<
    HookListToolParams,
    ToolResult
> {
    constructor(params: HookListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await hook.list();

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing hooks: ${errorMsg}`,
                    returnDisplay: `Error listing hooks: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const hooks = response.data || [];

            if (hooks.length === 0) {
                return {
                    llmContent: 'No hooks found.',
                    returnDisplay: 'No hooks found.',
                };
            }

            const hooksList = hooks.map((h, index) => {
                return `${index + 1}. ${h.name} (ID: ${h.id})
   - Trigger: ${h.trigger}
   - Action: ${h.action}
   - Enabled: ${h.enabled}
   - Trigger Count: ${h.triggerCount}`;
            }).join('\n\n');

            const llmContent = `Found ${hooks.length} hook(s):\n\n${hooksList}`;

            return {
                llmContent,
                returnDisplay: `Successfully listed ${hooks.length} hook(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing hooks: ${errorMessage}`,
                returnDisplay: `Error listing hooks: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the HookList tool logic
 */
export class HookListTool extends BaseDeclarativeTool<
    HookListToolParams,
    ToolResult
> {
    static readonly Name: string = 'hook_list';

    constructor() {
        super(
            HookListTool.Name,
            'HookList',
            `Lists all hooks configured in the system. Returns information about each hook including its name, ID, trigger type, action type, enabled status, and trigger count.`,
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: HookListToolParams,
    ): ToolInvocation<HookListToolParams, ToolResult> {
        return new HookListToolInvocation(params);
    }
}
