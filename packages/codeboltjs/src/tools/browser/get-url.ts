/**
 * Browser Get URL Tool - Gets the current page URL
 * Wraps the SDK's cbbrowser.getUrl() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';
import cbchat from '../../modules/chat';

export interface BrowserGetUrlParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserGetUrlInvocation extends BaseToolInvocation<BrowserGetUrlParams, ToolResult> {
    constructor(params: BrowserGetUrlParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.getUrl(options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Get URL failed';
                return {
                    llmContent: `Get URL failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            const url = response?.url || '';
            return {
                llmContent: `Current URL: ${url}`,
                returnDisplay: `Current URL: ${url}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting URL: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserGetUrlTool extends BaseDeclarativeTool<BrowserGetUrlParams, ToolResult> {
    static readonly Name: string = 'browser_get_url';

    constructor() {
        super(
            BrowserGetUrlTool.Name,
            'BrowserGetUrl',
            'Retrieves the current URL of the browser page.',
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

    protected createInvocation(params: BrowserGetUrlParams): ToolInvocation<BrowserGetUrlParams, ToolResult> {
        return new BrowserGetUrlInvocation(params);
    }
}
