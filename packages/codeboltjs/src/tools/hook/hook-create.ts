import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';
import type { HookConfig } from '../../types/hook';

export interface HookCreateParams {
    config: HookConfig;
}

class HookCreateInvocation extends BaseToolInvocation<HookCreateParams, ToolResult> {
    constructor(params: HookCreateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await hook.create(this.params.config);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Hook created successfully: ${JSON.stringify(response.data)}`,
                returnDisplay: `Created hook: ${response.data?.id || 'unknown'}`,
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

export class HookCreateTool extends BaseDeclarativeTool<HookCreateParams, ToolResult> {
    constructor() {
        super('hook_create', 'Create Hook', 'Create a new hook', Kind.Other, {
            type: 'object',
            properties: {
                config: { 
                    type: 'object',
                    description: 'Hook configuration',
                },
            },
            required: ['config'],
        });
    }

    protected override createInvocation(params: HookCreateParams): ToolInvocation<HookCreateParams, ToolResult> {
        return new HookCreateInvocation(params);
    }
}
