/**
 * Get ActionBlock Detail Tool
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import actionBlock from '../../modules/actionBlock';

export interface GetActionBlockDetailParams {
    actionBlockName: string;
    explanation?: string;
}

class GetActionBlockDetailInvocation extends BaseToolInvocation<GetActionBlockDetailParams, ToolResult> {
    constructor(params: GetActionBlockDetailParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await actionBlock.getDetail(this.params.actionBlockName);

            if (!response.success || !response.actionBlock) {
                return {
                    llmContent: `Error: ${response.error || 'Not found'}`,
                    returnDisplay: `Error: ${response.error || 'Not found'}`,
                    error: { message: response.error || 'Not found', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const b = response.actionBlock;
            const content = `ActionBlock: ${b.name}\nVersion: ${b.version}\nDescription: ${b.description}\nType: ${b.type}\nPath: ${b.path}`;

            return { llmContent: content, returnDisplay: content };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class GetActionBlockDetailTool extends BaseDeclarativeTool<GetActionBlockDetailParams, ToolResult> {
    constructor() {
        super('actionBlock_getDetail', 'Get ActionBlock Details', 'Get detailed information about an ActionBlock', Kind.Other, {
            type: 'object',
            properties: {
                actionBlockName: { type: 'string', description: 'ActionBlock name' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['actionBlockName'],
        });
    }

    protected override createInvocation(params: GetActionBlockDetailParams): ToolInvocation<GetActionBlockDetailParams, ToolResult> {
        return new GetActionBlockDetailInvocation(params);
    }
}
