/**
 * Crawler Start Tool - Starts the web crawler
 * Wraps the SDK's cbcrawler.start() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcrawler from '../../modules/crawler';

export interface CrawlerStartParams {
    // No parameters required
}

class CrawlerStartInvocation extends BaseToolInvocation<CrawlerStartParams, ToolResult> {
    constructor(params: CrawlerStartParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            cbcrawler.start();

            return {
                llmContent: 'Crawler started successfully.',
                returnDisplay: 'Crawler started',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error starting crawler: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class CrawlerStartTool extends BaseDeclarativeTool<CrawlerStartParams, ToolResult> {
    static readonly Name: string = 'crawler_start';

    constructor() {
        super(
            CrawlerStartTool.Name,
            'CrawlerStart',
            'Starts the web crawler for browser automation.',
            Kind.Execute,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: CrawlerStartParams): ToolInvocation<CrawlerStartParams, ToolResult> {
        return new CrawlerStartInvocation(params);
    }
}
