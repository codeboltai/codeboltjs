/**
 * Browser Get HTML Tool - Gets the HTML of the current page
 * Wraps the SDK's cbbrowser.getHTML() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';
import cbchat from '../../modules/chat';

export interface BrowserGetHtmlParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserGetHtmlInvocation extends BaseToolInvocation<BrowserGetHtmlParams, ToolResult> {
    constructor(params: BrowserGetHtmlParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.getHTML(options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Get HTML failed';
                return {
                    llmContent: `Get HTML failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            const html = response?.html || '';
            return {
                llmContent: `HTML content:\n\n${html}`,
                returnDisplay: 'Retrieved page HTML',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting HTML: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserGetHtmlTool extends BaseDeclarativeTool<BrowserGetHtmlParams, ToolResult> {
    static readonly Name: string = 'browser_get_html';

    constructor() {
        super(
            BrowserGetHtmlTool.Name,
            'BrowserGetHtml',
            'Retrieves the HTML content of the current browser page.',
            Kind.Read,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
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

    protected createInvocation(params: BrowserGetHtmlParams): ToolInvocation<BrowserGetHtmlParams, ToolResult> {
        return new BrowserGetHtmlInvocation(params);
    }
}
