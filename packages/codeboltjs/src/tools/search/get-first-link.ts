import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import search from '../../modules/search';

export interface GetFirstLinkParams {
    query: string;
    explanation?: string;
}

class GetFirstLinkInvocation extends BaseToolInvocation<GetFirstLinkParams, ToolResult> {
    constructor(params: GetFirstLinkParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const result = await search.get_first_link(this.params.query);
            return {
                llmContent: `First link:\n${result}`,
                returnDisplay: `First link for: ${this.params.query}`,
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

export class GetFirstLinkTool extends BaseDeclarativeTool<GetFirstLinkParams, ToolResult> {
    constructor() {
        super('search_get_first_link', 'Get First Link', 'Get first search result link', Kind.Other, {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['query'],
        });
    }

    protected override createInvocation(params: GetFirstLinkParams): ToolInvocation<GetFirstLinkParams, ToolResult> {
        return new GetFirstLinkInvocation(params);
    }
}
