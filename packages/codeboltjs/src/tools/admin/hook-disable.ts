/**
 * Hook Disable Tool - Disables a hook
 * Wraps the SDK's hook.disable() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

/**
 * Parameters for the HookDisable tool
 */
export interface HookDisableToolParams {
    /**
     * The ID of the hook to disable
     */
    hook_id: string;
}

class HookDisableToolInvocation extends BaseToolInvocation<
    HookDisableToolParams,
    ToolResult
> {
    constructor(params: HookDisableToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await hook.disable(this.params.hook_id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error disabling hook: ${errorMsg}`,
                    returnDisplay: `Error disabling hook: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const hookData = response.data;
            const hookName = hookData?.name || this.params.hook_id;

            return {
                llmContent: `Successfully disabled hook "${hookName}" (ID: ${this.params.hook_id})`,
                returnDisplay: `Successfully disabled hook "${hookName}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error disabling hook: ${errorMessage}`,
                returnDisplay: `Error disabling hook: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the HookDisable tool logic
 */
export class HookDisableTool extends BaseDeclarativeTool<
    HookDisableToolParams,
    ToolResult
> {
    static readonly Name: string = 'hook_disable';

    constructor() {
        super(
            HookDisableTool.Name,
            'HookDisable',
            `Disables a hook by its ID. Once disabled, the hook will no longer trigger actions when its configured trigger events occur.`,
            Kind.Edit,
            {
                properties: {
                    hook_id: {
                        description: 'The unique identifier of the hook to disable',
                        type: 'string',
                    },
                },
                required: ['hook_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: HookDisableToolParams,
    ): string | null {
        if (!params.hook_id || params.hook_id.trim() === '') {
            return "The 'hook_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: HookDisableToolParams,
    ): ToolInvocation<HookDisableToolParams, ToolResult> {
        return new HookDisableToolInvocation(params);
    }
}
