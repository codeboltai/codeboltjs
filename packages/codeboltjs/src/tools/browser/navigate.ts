/**
 * Browser Navigate Tool - Navigates to a URL
 * Wraps the SDK's cbbrowser.goToPage() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

export interface BrowserNavigateParams {
    /** The URL to navigate to */
    url: string;
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserNavigateInvocation extends BaseToolInvocation<BrowserNavigateParams, ToolResult> {
    constructor(params: BrowserNavigateParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.goToPage(this.params.url, options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Navigation failed';
                return {
                    llmContent: `Navigation failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Navigated to ${this.params.url}`,
                returnDisplay: `Navigated to ${this.params.url}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error navigating: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserNavigateTool extends BaseDeclarativeTool<BrowserNavigateParams, ToolResult> {
    static readonly Name: string = 'browser_navigate';

    constructor() {
        super(
            BrowserNavigateTool.Name,
            'BrowserNavigate',
            'Navigates the browser to a specified URL.',
            Kind.Execute,
            {
                properties: {
                    url: {
                        description: 'The URL to navigate to.',
                        type: 'string',
                    },
                    instance_id: {
                        description: 'Optional browser instance ID for multi-instance support.',
                        type: 'string',
                    },
                },
                required: ['url'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: BrowserNavigateParams): string | null {
        if (!params.url || params.url.trim() === '') {
            return "'url' is required for navigate";
        }
        return null;
    }

    protected createInvocation(params: BrowserNavigateParams): ToolInvocation<BrowserNavigateParams, ToolResult> {
        return new BrowserNavigateInvocation(params);
    }
}
