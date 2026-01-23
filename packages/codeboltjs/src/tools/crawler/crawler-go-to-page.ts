/**
 * Crawler Go To Page Tool - Navigates the crawler to a specified URL
 * Wraps the SDK's cbcrawler.goToPage() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcrawler from '../../modules/crawler';

export interface CrawlerGoToPageParams {
    /** The URL to navigate to */
    url: string;
}

class CrawlerGoToPageInvocation extends BaseToolInvocation<CrawlerGoToPageParams, ToolResult> {
    constructor(params: CrawlerGoToPageParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            cbcrawler.goToPage(this.params.url);

            return {
                llmContent: `Navigated to: ${this.params.url}`,
                returnDisplay: `Navigated to: ${this.params.url}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error navigating to page: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class CrawlerGoToPageTool extends BaseDeclarativeTool<CrawlerGoToPageParams, ToolResult> {
    static readonly Name: string = 'crawler_go_to_page';

    constructor() {
        super(
            CrawlerGoToPageTool.Name,
            'CrawlerGoToPage',
            'Directs the web crawler to navigate to a specified URL.',
            Kind.Execute,
            {
                properties: {
                    url: {
                        description: 'The URL for the crawler to navigate to.',
                        type: 'string',
                    },
                },
                required: ['url'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: CrawlerGoToPageParams): string | null {
        if (!params.url || params.url.trim() === '') {
            return "'url' is required";
        }
        return null;
    }

    protected createInvocation(params: CrawlerGoToPageParams): ToolInvocation<CrawlerGoToPageParams, ToolResult> {
        return new CrawlerGoToPageInvocation(params);
    }
}
