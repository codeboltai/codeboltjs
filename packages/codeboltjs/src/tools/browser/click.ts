/**
 * Browser Click Tool - Clicks on an element
 * Wraps the SDK's cbbrowser.click() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

export interface BrowserClickParams {
    /** The element ID to click */
    element_id: string;
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserClickInvocation extends BaseToolInvocation<BrowserClickParams, ToolResult> {
    constructor(params: BrowserClickParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.click(this.params.element_id, options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Click failed';
                return {
                    llmContent: `Click failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Clicked element: ${this.params.element_id}`,
                returnDisplay: `Clicked element: ${this.params.element_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error clicking element: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserClickTool extends BaseDeclarativeTool<BrowserClickParams, ToolResult> {
    static readonly Name: string = 'browser_click';

    constructor() {
        super(
            BrowserClickTool.Name,
            'BrowserClick',
            'Clicks on an element in the browser page.',
            Kind.Execute,
            {
                properties: {
                    element_id: {
                        description: 'The ID of the element to click.',
                        type: 'string',
                    },
                    instance_id: {
                        description: 'Optional browser instance ID for multi-instance support.',
                        type: 'string',
                    },
                },
                required: ['element_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: BrowserClickParams): string | null {
        if (!params.element_id || params.element_id.trim() === '') {
            return "'element_id' is required for click";
        }
        return null;
    }

    protected createInvocation(params: BrowserClickParams): ToolInvocation<BrowserClickParams, ToolResult> {
        return new BrowserClickInvocation(params);
    }
}
