import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';

export interface HookInitializeParams {
    projectPath: string;
}

class HookInitializeInvocation extends BaseToolInvocation<HookInitializeParams, ToolResult> {
    constructor(params: HookInitializeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await hook.initialize(this.params.projectPath);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Hook manager initialized for project: ${this.params.projectPath}`,
                returnDisplay: `Initialized hook manager for: ${this.params.projectPath}`,
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

export class HookInitializeTool extends BaseDeclarativeTool<HookInitializeParams, ToolResult> {
    constructor() {
        super('hook_initialize', 'Initialize Hook Manager', 'Initialize the hook manager for a project', Kind.Other, {
            type: 'object',
            properties: {
                projectPath: { type: 'string', description: 'Path to the project' },
            },
            required: ['projectPath'],
        });
    }

    protected override createInvocation(params: HookInitializeParams): ToolInvocation<HookInitializeParams, ToolResult> {
        return new HookInitializeInvocation(params);
    }
}
