/**
 * Browser Screenshot Tool - Takes a screenshot of the current page
 * Wraps the SDK's cbbrowser.screenshot() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

export interface BrowserScreenshotParams {
    /** Optional browser instance ID */
    instance_id?: string;
    /** Whether to take a full page screenshot */
    full_page?: boolean;
    /** Image quality (0-100) */
    quality?: number;
    /** Image format ('png' or 'jpeg') */
    format?: 'png' | 'jpeg';
}

class BrowserScreenshotInvocation extends BaseToolInvocation<BrowserScreenshotParams, ToolResult> {
    constructor(params: BrowserScreenshotParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const options: any = {};
            if (this.params.instance_id) options.instanceId = this.params.instance_id;
            if (this.params.full_page !== undefined) options.fullPage = this.params.full_page;
            if (this.params.quality !== undefined) options.quality = this.params.quality;
            if (this.params.format) options.format = this.params.format;

            const response = await cbbrowser.screenshot(Object.keys(options).length > 0 ? options : undefined);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Screenshot failed';
                return {
                    llmContent: `Screenshot failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            let output = 'Screenshot captured successfully.';
            if (response && response.screenshot) {
                output += '\n\n[Screenshot data available]';
            }

            return {
                llmContent: output,
                returnDisplay: 'Screenshot taken',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error taking screenshot: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserScreenshotTool extends BaseDeclarativeTool<BrowserScreenshotParams, ToolResult> {
    static readonly Name: string = 'browser_screenshot';

    constructor() {
        super(
            BrowserScreenshotTool.Name,
            'BrowserScreenshot',
            'Takes a screenshot of the current browser page.',
            Kind.Execute,
            {
                properties: {
                    instance_id: {
                        description: 'Optional browser instance ID for multi-instance support.',
                        type: 'string',
                    },
                    full_page: {
                        description: 'Whether to take a full page screenshot (default: false).',
                        type: 'boolean',
                    },
                    quality: {
                        description: 'Image quality from 0-100 (for JPEG format).',
                        type: 'number',
                    },
                    format: {
                        description: "Image format: 'png' or 'jpeg'.",
                        type: 'string',
                        enum: ['png', 'jpeg'],
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: BrowserScreenshotParams): ToolInvocation<BrowserScreenshotParams, ToolResult> {
        return new BrowserScreenshotInvocation(params);
    }
}
