import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

export interface HookListParams {
    // No parameters needed
}

class HookListInvocation extends BaseToolInvocation<HookListParams, ToolResult> {
    constructor(params: HookListParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await hook.list();
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const hooks = response.data || [];
            return {
                llmContent: `Found ${hooks.length} hooks: ${JSON.stringify(hooks)}`,
                returnDisplay: `Listed ${hooks.length} hooks`,
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

export class HookListTool extends BaseDeclarativeTool<HookListParams, ToolResult> {
    constructor() {
        super('hook_list', 'List Hooks', 'List all hooks', Kind.Other, {
            type: 'object',
            properties: {},
            required: [],
        });
    }

    protected override createInvocation(params: HookListParams): ToolInvocation<HookListParams, ToolResult> {
        return new HookListInvocation(params);
    }
}
