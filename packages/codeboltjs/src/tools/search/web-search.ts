import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import search from '../../modules/search';

export interface WebSearchParams {
    query: string;
    engine?: string;
    explanation?: string;
}

class WebSearchInvocation extends BaseToolInvocation<WebSearchParams, ToolResult> {
    constructor(params: WebSearchParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const result = await search.search(this.params.query);
            return {
                llmContent: `Web search results:\n${result}`,
                returnDisplay: `Search completed for: ${this.params.query}`,
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

export class WebSearchTool extends BaseDeclarativeTool<WebSearchParams, ToolResult> {
    constructor() {
        super('search_web', 'Web Search', 'Perform a web search', Kind.Other, {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query' },
                engine: { type: 'string', description: 'Search engine' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['query'],
        });
    }

    protected override createInvocation(params: WebSearchParams): ToolInvocation<WebSearchParams, ToolResult> {
        return new WebSearchInvocation(params);
    }
}
