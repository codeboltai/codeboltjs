import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

export interface HookGetParams {
    hookId: string;
}

class HookGetInvocation extends BaseToolInvocation<HookGetParams, ToolResult> {
    constructor(params: HookGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await hook.get(this.params.hookId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Hook retrieved: ${JSON.stringify(response.data)}`,
                returnDisplay: `Retrieved hook: ${this.params.hookId}`,
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

export class HookGetTool extends BaseDeclarativeTool<HookGetParams, ToolResult> {
    constructor() {
        super('hook_get', 'Get Hook', 'Get a hook by ID', Kind.Other, {
            type: 'object',
            properties: {
                hookId: { type: 'string', description: 'Hook ID' },
            },
            required: ['hookId'],
        });
    }

    protected override createInvocation(params: HookGetParams): ToolInvocation<HookGetParams, ToolResult> {
        return new HookGetInvocation(params);
    }
}
