/**
 * Start ActionBlock Tool
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import actionBlock from '../../modules/actionBlock';

export interface StartActionBlockParams {
    actionBlockName: string;
    params?: Record<string, any>;
    explanation?: string;
}

class StartActionBlockInvocation extends BaseToolInvocation<StartActionBlockParams, ToolResult> {
    constructor(params: StartActionBlockParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await actionBlock.start(this.params.actionBlockName, this.params.params);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            return { llmContent: JSON.stringify(response), returnDisplay: JSON.stringify(response) };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class StartActionBlockTool extends BaseDeclarativeTool<StartActionBlockParams, ToolResult> {
    constructor() {
        super('actionBlock_start', 'Start ActionBlock', 'Start an ActionBlock by name', Kind.Other, {
            type: 'object',
            properties: {
                actionBlockName: { type: 'string', description: 'ActionBlock name' },
                params: { type: 'object', description: 'Optional parameters' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['actionBlockName'],
        });
    }

    protected override createInvocation(params: StartActionBlockParams): ToolInvocation<StartActionBlockParams, ToolResult> {
        return new StartActionBlockInvocation(params);
    }
}
