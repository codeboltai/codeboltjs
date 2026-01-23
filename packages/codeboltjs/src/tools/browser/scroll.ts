/**
 * Browser Scroll Tool - Scrolls the page
 * Wraps the SDK's cbbrowser.scroll() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

export interface BrowserScrollParams {
    /** Scroll direction: 'up', 'down', 'left', 'right' */
    direction: 'up' | 'down' | 'left' | 'right';
    /** Number of pixels to scroll */
    pixels: string;
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserScrollInvocation extends BaseToolInvocation<BrowserScrollParams, ToolResult> {
    constructor(params: BrowserScrollParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.scroll(this.params.direction, this.params.pixels, options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Scroll failed';
                return {
                    llmContent: `Scroll failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Scrolled ${this.params.direction} by ${this.params.pixels} pixels`,
                returnDisplay: `Scrolled ${this.params.direction} by ${this.params.pixels} pixels`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error scrolling: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserScrollTool extends BaseDeclarativeTool<BrowserScrollParams, ToolResult> {
    static readonly Name: string = 'browser_scroll';

    constructor() {
        super(
            BrowserScrollTool.Name,
            'BrowserScroll',
            'Scrolls the browser page in a specified direction.',
            Kind.Execute,
            {
                properties: {
                    direction: {
                        description: "Scroll direction: 'up', 'down', 'left', 'right'.",
                        type: 'string',
                        enum: ['up', 'down', 'left', 'right'],
                    },
                    pixels: {
                        description: 'Number of pixels to scroll.',
                        type: 'string',
                    },
                    instance_id: {
                        description: 'Optional browser instance ID for multi-instance support.',
                        type: 'string',
                    },
                },
                required: ['direction', 'pixels'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: BrowserScrollParams): string | null {
        if (!params.direction) {
            return "'direction' is required for scroll";
        }
        if (!['up', 'down', 'left', 'right'].includes(params.direction)) {
            return "'direction' must be one of: up, down, left, right";
        }
        if (!params.pixels) {
            return "'pixels' is required for scroll";
        }
        return null;
    }

    protected createInvocation(params: BrowserScrollParams): ToolInvocation<BrowserScrollParams, ToolResult> {
        return new BrowserScrollInvocation(params);
    }
}
