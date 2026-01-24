import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';
import type { HookConfig } from '../../types/hook';

export interface HookUpdateParams {
    hookId: string;
    config: Partial<HookConfig>;
}

class HookUpdateInvocation extends BaseToolInvocation<HookUpdateParams, ToolResult> {
    constructor(params: HookUpdateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await hook.update(this.params.hookId, this.params.config);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Hook updated successfully: ${JSON.stringify(response.data)}`,
                returnDisplay: `Updated hook: ${this.params.hookId}`,
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

export class HookUpdateTool extends BaseDeclarativeTool<HookUpdateParams, ToolResult> {
    constructor() {
        super('hook_update', 'Update Hook', 'Update an existing hook', Kind.Other, {
            type: 'object',
            properties: {
                hookId: { type: 'string', description: 'Hook ID' },
                config: { 
                    type: 'object',
                    description: 'Updated hook configuration',
                },
            },
            required: ['hookId', 'config'],
        });
    }

    protected override createInvocation(params: HookUpdateParams): ToolInvocation<HookUpdateParams, ToolResult> {
        return new HookUpdateInvocation(params);
    }
}
