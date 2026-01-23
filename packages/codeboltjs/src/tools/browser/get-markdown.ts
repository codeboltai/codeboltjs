/**
 * Browser Get Markdown Tool - Gets the page content as Markdown
 * Wraps the SDK's cbbrowser.getMarkdown() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

export interface BrowserGetMarkdownParams {
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserGetMarkdownInvocation extends BaseToolInvocation<BrowserGetMarkdownParams, ToolResult> {
    constructor(params: BrowserGetMarkdownParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.getMarkdown(options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Get Markdown failed';
                return {
                    llmContent: `Get Markdown failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            const markdown = response?.markdown || '';
            return {
                llmContent: `Markdown content:\n\n${markdown}`,
                returnDisplay: 'Retrieved page as Markdown',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting Markdown: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserGetMarkdownTool extends BaseDeclarativeTool<BrowserGetMarkdownParams, ToolResult> {
    static readonly Name: string = 'browser_get_markdown';

    constructor() {
        super(
            BrowserGetMarkdownTool.Name,
            'BrowserGetMarkdown',
            'Retrieves the current browser page content as Markdown.',
            Kind.Read,
            {
                properties: {
                    instance_id: {
                        description: 'Optional browser instance ID for multi-instance support.',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: BrowserGetMarkdownParams): ToolInvocation<BrowserGetMarkdownParams, ToolResult> {
        return new BrowserGetMarkdownInvocation(params);
    }
}
