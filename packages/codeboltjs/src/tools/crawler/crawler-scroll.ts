/**
 * Crawler Scroll Tool - Scrolls the crawler in a specified direction
 * Wraps the SDK's cbcrawler.scroll() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcrawler from '../../modules/crawler';

export interface CrawlerScrollParams {
    /** The direction to scroll ('up', 'down', 'left', 'right') */
    direction: 'up' | 'down' | 'left' | 'right';
}

class CrawlerScrollInvocation extends BaseToolInvocation<CrawlerScrollParams, ToolResult> {
    constructor(params: CrawlerScrollParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            cbcrawler.scroll(this.params.direction);

            return {
                llmContent: `Scrolled ${this.params.direction} successfully.`,
                returnDisplay: `Scrolled ${this.params.direction}`,
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

export class CrawlerScrollTool extends BaseDeclarativeTool<CrawlerScrollParams, ToolResult> {
    static readonly Name: string = 'crawler_scroll';

    constructor() {
        super(
            CrawlerScrollTool.Name,
            'CrawlerScroll',
            'Scrolls the web crawler in a specified direction (up, down, left, or right).',
            Kind.Execute,
            {
                properties: {
                    direction: {
                        description: "The direction to scroll: 'up', 'down', 'left', or 'right'.",
                        type: 'string',
                        enum: ['up', 'down', 'left', 'right'],
                    },
                },
                required: ['direction'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: CrawlerScrollParams): string | null {
        if (!params.direction) {
            return "'direction' is required";
        }
        const validDirections = ['up', 'down', 'left', 'right'];
        if (!validDirections.includes(params.direction)) {
            return `'direction' must be one of: ${validDirections.join(', ')}`;
        }
        return null;
    }

    protected createInvocation(params: CrawlerScrollParams): ToolInvocation<CrawlerScrollParams, ToolResult> {
        return new CrawlerScrollInvocation(params);
    }
}
