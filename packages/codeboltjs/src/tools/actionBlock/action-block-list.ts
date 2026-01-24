/**
 * List ActionBlocks Tool
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import actionBlock, { ActionBlockType } from '../../modules/actionBlock';

export interface ListActionBlocksParams {
    filterType?: 'filesystem' | 'runtime' | 'builtin';
    explanation?: string;
}

class ListActionBlocksInvocation extends BaseToolInvocation<ListActionBlocksParams, ToolResult> {
    constructor(params: ListActionBlocksParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const filter = this.params.filterType ? { type: this.params.filterType as ActionBlockType } : undefined;
            const response = await actionBlock.list(filter);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const blocks = response.actionBlocks || [];
            const content = `Found ${blocks.length} ActionBlocks:\n${blocks.map(b => `- ${b.name} (v${b.version}): ${b.description}`).join('\n')}`;

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

export class ListActionBlocksTool extends BaseDeclarativeTool<ListActionBlocksParams, ToolResult> {
    constructor() {
        super('actionBlock_list', 'List ActionBlocks', 'List all available ActionBlocks', Kind.Other, {
            type: 'object',
            properties: {
                filterType: { type: 'string', enum: ['filesystem', 'runtime', 'builtin'], description: 'Filter by type' },
                explanation: { type: 'string', description: 'Explanation' },
            },
        });
    }

    protected override createInvocation(params: ListActionBlocksParams): ToolInvocation<ListActionBlocksParams, ToolResult> {
        return new ListActionBlocksInvocation(params);
    }
}
