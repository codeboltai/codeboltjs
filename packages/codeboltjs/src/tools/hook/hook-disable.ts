import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

export interface HookDisableParams {
    hookId: string;
}

class HookDisableInvocation extends BaseToolInvocation<HookDisableParams, ToolResult> {
    constructor(params: HookDisableParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await hook.disable(this.params.hookId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Hook disabled successfully: ${this.params.hookId}`,
                returnDisplay: `Disabled hook: ${this.params.hookId}`,
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

export class HookDisableTool extends BaseDeclarativeTool<HookDisableParams, ToolResult> {
    constructor() {
        super('hook_disable', 'Disable Hook', 'Disable a hook', Kind.Other, {
            type: 'object',
            properties: {
                hookId: { type: 'string', description: 'Hook ID' },
            },
            required: ['hookId'],
        });
    }

    protected override createInvocation(params: HookDisableParams): ToolInvocation<HookDisableParams, ToolResult> {
        return new HookDisableInvocation(params);
    }
}
