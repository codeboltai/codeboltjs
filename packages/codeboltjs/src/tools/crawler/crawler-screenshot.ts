/**
 * Crawler Screenshot Tool - Takes a screenshot using the crawler
 * Wraps the SDK's cbcrawler.screenshot() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcrawler from '../../modules/crawler';

export interface CrawlerScreenshotParams {
    // No parameters required
}

class CrawlerScreenshotInvocation extends BaseToolInvocation<CrawlerScreenshotParams, ToolResult> {
    constructor(params: CrawlerScreenshotParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            cbcrawler.screenshot();

            return {
                llmContent: 'Screenshot captured successfully.',
                returnDisplay: 'Screenshot captured',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error capturing screenshot: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class CrawlerScreenshotTool extends BaseDeclarativeTool<CrawlerScreenshotParams, ToolResult> {
    static readonly Name: string = 'crawler_screenshot';

    constructor() {
        super(
            CrawlerScreenshotTool.Name,
            'CrawlerScreenshot',
            'Takes a screenshot of the current page using the web crawler.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: CrawlerScreenshotParams): ToolInvocation<CrawlerScreenshotParams, ToolResult> {
        return new CrawlerScreenshotInvocation(params);
    }
}
