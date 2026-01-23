/**
 * Browser Enter Tool - Presses the Enter key
 * Wraps the SDK's cbbrowser.enter() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

export interface BrowserEnterParams {
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserEnterInvocation extends BaseToolInvocation<BrowserEnterParams, ToolResult> {
    constructor(params: BrowserEnterParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.enter(options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Enter failed';
                return {
                    llmContent: `Enter failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: 'Pressed Enter',
                returnDisplay: 'Pressed Enter',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error pressing Enter: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserEnterTool extends BaseDeclarativeTool<BrowserEnterParams, ToolResult> {
    static readonly Name: string = 'browser_enter';

    constructor() {
        super(
            BrowserEnterTool.Name,
            'BrowserEnter',
            'Simulates pressing the Enter key in the browser.',
            Kind.Execute,
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

    protected createInvocation(params: BrowserEnterParams): ToolInvocation<BrowserEnterParams, ToolResult> {
        return new BrowserEnterInvocation(params);
    }
}
