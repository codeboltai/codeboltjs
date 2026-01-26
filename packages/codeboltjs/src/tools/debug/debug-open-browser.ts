/**
 * Debug Open Browser Tool - Opens a debug browser at a specified URL and port
 * Wraps the SDK's debug.openDebugBrowser() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import debug from '../../modules/debug';

export interface DebugOpenBrowserParams {
    /** The URL where the debug browser should be opened */
    url: string;
    /** The port on which the debug browser will listen */
    port: number;
}

class DebugOpenBrowserInvocation extends BaseToolInvocation<DebugOpenBrowserParams, ToolResult> {
    constructor(params: DebugOpenBrowserParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await debug.openDebugBrowser(this.params.url, this.params.port);

            if (response && (response as any).error) {
                const errorMsg = typeof (response as any).error === 'string'
                    ? (response as any).error
                    : (response as any).error?.message || 'Open debug browser failed';
                return {
                    llmContent: `Failed to open debug browser: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Debug browser opened successfully at URL: ${this.params.url} on port: ${this.params.port}`,
                returnDisplay: `Debug browser opened at ${this.params.url}:${this.params.port}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error opening debug browser: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class DebugOpenBrowserTool extends BaseDeclarativeTool<DebugOpenBrowserParams, ToolResult> {
    static readonly Name: string = 'debug_open_browser';

    constructor() {
        super(
            DebugOpenBrowserTool.Name,
            'DebugOpenBrowser',
            'Opens a debug browser at the specified URL and port for debugging purposes.',
            Kind.Edit,
            {
                properties: {
                    url: {
                        description: 'The URL where the debug browser should be opened.',
                        type: 'string',
                    },
                    port: {
                        description: 'The port on which the debug browser will listen.',
                        type: 'number',
                    },
                },
                required: ['url', 'port'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: DebugOpenBrowserParams): string | null {
        if (!params.url || params.url.trim() === '') {
            return "'url' is required and cannot be empty";
        }
        if (params.port === undefined || params.port === null) {
            return "'port' is required";
        }
        if (typeof params.port !== 'number' || !Number.isInteger(params.port)) {
            return "'port' must be an integer";
        }
        if (params.port < 1 || params.port > 65535) {
            return "'port' must be between 1 and 65535";
        }
        return null;
    }

    protected createInvocation(params: DebugOpenBrowserParams): ToolInvocation<DebugOpenBrowserParams, ToolResult> {
        return new DebugOpenBrowserInvocation(params);
    }
}
