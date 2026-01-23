/**
 * Browser Close Tool - Closes the browser
 * Wraps the SDK's cbbrowser.close() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

export interface BrowserCloseParams {
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserCloseInvocation extends BaseToolInvocation<BrowserCloseParams, ToolResult> {
    constructor(params: BrowserCloseParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            await cbbrowser.close(options);

            return {
                llmContent: 'Browser closed successfully',
                returnDisplay: 'Browser closed',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error closing browser: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserCloseTool extends BaseDeclarativeTool<BrowserCloseParams, ToolResult> {
    static readonly Name: string = 'browser_close';

    constructor() {
        super(
            BrowserCloseTool.Name,
            'BrowserClose',
            'Closes the browser page.',
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

    protected createInvocation(params: BrowserCloseParams): ToolInvocation<BrowserCloseParams, ToolResult> {
        return new BrowserCloseInvocation(params);
    }
}
