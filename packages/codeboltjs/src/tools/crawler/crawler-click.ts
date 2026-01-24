/**
 * Crawler Click Tool - Simulates a click event on an element
 * Wraps the SDK's cbcrawler.click() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcrawler from '../../modules/crawler';

export interface CrawlerClickParams {
    /** The ID of the element to click */
    id: string;
}

class CrawlerClickInvocation extends BaseToolInvocation<CrawlerClickParams, ToolResult> {
    constructor(params: CrawlerClickParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbcrawler.click(this.params.id);

            let output = `Clicked element with ID: ${this.params.id}`;
            if (response) {
                output += `\nResponse: ${JSON.stringify(response)}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Clicked: ${this.params.id}`,
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

export class CrawlerClickTool extends BaseDeclarativeTool<CrawlerClickParams, ToolResult> {
    static readonly Name: string = 'crawler_click';

    constructor() {
        super(
            CrawlerClickTool.Name,
            'CrawlerClick',
            'Simulates a click event on an element with the specified ID.',
            Kind.Execute,
            {
                properties: {
                    id: {
                        description: 'The ID of the element to be clicked.',
                        type: 'string',
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: CrawlerClickParams): string | null {
        if (!params.id || params.id.trim() === '') {
            return "'id' is required";
        }
        return null;
    }

    protected createInvocation(params: CrawlerClickParams): ToolInvocation<CrawlerClickParams, ToolResult> {
        return new CrawlerClickInvocation(params);
    }
}
