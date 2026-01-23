/**
 * Browser Get Content Tool - Gets the content of the current page
 * Wraps the SDK's cbbrowser.getContent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

export interface BrowserGetContentParams {
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserGetContentInvocation extends BaseToolInvocation<BrowserGetContentParams, ToolResult> {
    constructor(params: BrowserGetContentParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.getContent(options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Get content failed';
                return {
                    llmContent: `Get content failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            const content = response?.content || '';
            return {
                llmContent: `Page content:\n\n${content}`,
                returnDisplay: 'Retrieved page content',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting content: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserGetContentTool extends BaseDeclarativeTool<BrowserGetContentParams, ToolResult> {
    static readonly Name: string = 'browser_get_content';

    constructor() {
        super(
            BrowserGetContentTool.Name,
            'BrowserGetContent',
            'Retrieves the text content of the current browser page.',
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

    protected createInvocation(params: BrowserGetContentParams): ToolInvocation<BrowserGetContentParams, ToolResult> {
        return new BrowserGetContentInvocation(params);
    }
}
