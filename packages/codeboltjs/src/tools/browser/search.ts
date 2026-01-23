/**
 * Browser Search Tool - Searches within an element
 * Wraps the SDK's cbbrowser.search() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';
import cbchat from '../../modules/chat';

export interface BrowserSearchParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** The element ID to search in */
    element_id: string;
    /** The search query */
    query: string;
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserSearchInvocation extends BaseToolInvocation<BrowserSearchParams, ToolResult> {
    constructor(params: BrowserSearchParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.search(this.params.element_id, this.params.query, options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Search failed';
                return {
                    llmContent: `Search failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Searched for: ${this.params.query}`,
                returnDisplay: `Searched for: ${this.params.query}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error searching: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserSearchTool extends BaseDeclarativeTool<BrowserSearchParams, ToolResult> {
    static readonly Name: string = 'browser_search';

    constructor() {
        super(
            BrowserSearchTool.Name,
            'BrowserSearch',
            'Performs a search within an element on the browser page.',
            Kind.Execute,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    element_id: {
                        description: 'The ID of the element to perform the search in.',
                        type: 'string',
                    },
                    query: {
                        description: 'The search query.',
                        type: 'string',
                    },
                    instance_id: {
                        description: 'Optional browser instance ID for multi-instance support.',
                        type: 'string',
                    },
                },
                required: ['element_id', 'query'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: BrowserSearchParams): string | null {
        if (!params.element_id || params.element_id.trim() === '') {
            return "'element_id' is required for search";
        }
        if (!params.query || params.query.trim() === '') {
            return "'query' is required for search";
        }
        return null;
    }

    protected createInvocation(params: BrowserSearchParams): ToolInvocation<BrowserSearchParams, ToolResult> {
        return new BrowserSearchInvocation(params);
    }
}
