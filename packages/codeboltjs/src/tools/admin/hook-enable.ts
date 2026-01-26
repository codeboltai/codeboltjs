/**
 * Hook Enable Tool - Enables a hook
 * Wraps the SDK's hook.enable() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

/**
 * Parameters for the HookEnable tool
 */
export interface HookEnableToolParams {
    /**
     * The ID of the hook to enable
     */
    hook_id: string;
}

class HookEnableToolInvocation extends BaseToolInvocation<
    HookEnableToolParams,
    ToolResult
> {
    constructor(params: HookEnableToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await hook.enable(this.params.hook_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error enabling hook: ${errorMsg}`,
                    returnDisplay: `Error enabling hook: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const hookData = response.data;
            const hookName = hookData?.name || this.params.hook_id;

            return {
                llmContent: `Successfully enabled hook "${hookName}" (ID: ${this.params.hook_id})`,
                returnDisplay: `Successfully enabled hook "${hookName}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error enabling hook: ${errorMessage}`,
                returnDisplay: `Error enabling hook: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the HookEnable tool logic
 */
export class HookEnableTool extends BaseDeclarativeTool<
    HookEnableToolParams,
    ToolResult
> {
    static readonly Name: string = 'hook_enable';

    constructor() {
        super(
            HookEnableTool.Name,
            'HookEnable',
            `Enables a hook by its ID. Once enabled, the hook will start triggering actions when its configured trigger events occur.`,
            Kind.Edit,
            {
                properties: {
                    hook_id: {
                        description: 'The unique identifier of the hook to enable',
                        type: 'string',
                    },
                },
                required: ['hook_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: HookEnableToolParams,
    ): string | null {
        if (!params.hook_id || params.hook_id.trim() === '') {
            return "The 'hook_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: HookEnableToolParams,
    ): ToolInvocation<HookEnableToolParams, ToolResult> {
        return new HookEnableToolInvocation(params);
    }
}
