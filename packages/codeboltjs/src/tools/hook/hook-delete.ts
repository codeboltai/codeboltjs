import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

export interface HookDeleteParams {
    hookId: string;
}

class HookDeleteInvocation extends BaseToolInvocation<HookDeleteParams, ToolResult> {
    constructor(params: HookDeleteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await hook.delete(this.params.hookId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Hook deleted successfully: ${this.params.hookId}`,
                returnDisplay: `Deleted hook: ${this.params.hookId}`,
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

export class HookDeleteTool extends BaseDeclarativeTool<HookDeleteParams, ToolResult> {
    constructor() {
        super('hook_delete', 'Delete Hook', 'Delete a hook', Kind.Other, {
            type: 'object',
            properties: {
                hookId: { type: 'string', description: 'Hook ID' },
            },
            required: ['hookId'],
        });
    }

    protected override createInvocation(params: HookDeleteParams): ToolInvocation<HookDeleteParams, ToolResult> {
        return new HookDeleteInvocation(params);
    }
}
