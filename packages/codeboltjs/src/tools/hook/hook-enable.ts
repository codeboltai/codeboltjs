import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

export interface HookEnableParams {
    hookId: string;
}

class HookEnableInvocation extends BaseToolInvocation<HookEnableParams, ToolResult> {
    constructor(params: HookEnableParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await hook.enable(this.params.hookId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Hook enabled successfully: ${this.params.hookId}`,
                returnDisplay: `Enabled hook: ${this.params.hookId}`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class HookEnableTool extends BaseDeclarativeTool<HookEnableParams, ToolResult> {
    constructor() {
        super('hook_enable', 'Enable Hook', 'Enable a hook', Kind.Other, {
            type: 'object',
            properties: {
                hookId: { type: 'string', description: 'Hook ID' },
            },
            required: ['hookId'],
        });
    }

    protected override createInvocation(params: HookEnableParams): ToolInvocation<HookEnableParams, ToolResult> {
        return new HookEnableInvocation(params);
    }
}
