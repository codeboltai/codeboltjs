/**
 * Browser Action Tool - Performs browser automation actions
 * Wraps the SDK's cbbrowser methods
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';

/**
 * Supported browser actions
 */
export type BrowserActionType =
    | 'navigate'
    | 'screenshot'
    | 'click'
    | 'type'
    | 'scroll'
    | 'get_content'
    | 'get_html'
    | 'get_markdown'
    | 'get_url'
    | 'close'
    | 'enter'
    | 'search';

/**
 * Parameters for the BrowserAction tool
 */
export interface BrowserActionToolParams {
    /**
     * The browser action to perform
     */
    action: BrowserActionType;

    /**
     * URL for navigate action
     */
    url?: string;

    /**
     * Element ID for click/type/search actions
     */
    element_id?: string;

    /**
     * Text for type action
     */
    text?: string;

    /**
     * Query for search action
     */
    query?: string;

    /**
     * Scroll direction ('up', 'down', 'left', 'right')
     */
    direction?: string;

    /**
     * Pixels to scroll
     */
    pixels?: string;

    /**
     * Browser instance ID (optional)
     */
    instance_id?: string;
}

class BrowserActionToolInvocation extends BaseToolInvocation<
    BrowserActionToolParams,
    ToolResult
> {
    constructor(params: BrowserActionToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const action = this.params.action;
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            let response: any;
            let successMessage: string;

            switch (action) {
                case 'navigate':
                    if (!this.params.url) {
                        return this.createError("'url' is required for navigate action");
                    }
                    response = await cbbrowser.goToPage(this.params.url, options);
                    successMessage = `Navigated to ${this.params.url}`;
                    break;

                case 'screenshot':
                    response = await cbbrowser.screenshot(options);
                    successMessage = 'Screenshot taken';
                    break;

                case 'click':
                    if (!this.params.element_id) {
                        return this.createError("'element_id' is required for click action");
                    }
                    response = await cbbrowser.click(this.params.element_id, options);
                    successMessage = `Clicked element: ${this.params.element_id}`;
                    break;

                case 'type':
                    if (!this.params.element_id) {
                        return this.createError("'element_id' is required for type action");
                    }
                    if (!this.params.text) {
                        return this.createError("'text' is required for type action");
                    }
                    response = await cbbrowser.type(this.params.element_id, this.params.text, options);
                    successMessage = `Typed text into element: ${this.params.element_id}`;
                    break;

                case 'scroll':
                    if (!this.params.direction) {
                        return this.createError("'direction' is required for scroll action");
                    }
                    if (!this.params.pixels) {
                        return this.createError("'pixels' is required for scroll action");
                    }
                    response = await cbbrowser.scroll(this.params.direction, this.params.pixels, options);
                    successMessage = `Scrolled ${this.params.direction} by ${this.params.pixels} pixels`;
                    break;

                case 'get_content':
                    response = await cbbrowser.getContent(options);
                    successMessage = 'Retrieved page content';
                    break;

                case 'get_html':
                    response = await cbbrowser.getHTML(options);
                    successMessage = 'Retrieved page HTML';
                    break;

                case 'get_markdown':
                    response = await cbbrowser.getMarkdown(options);
                    successMessage = 'Retrieved page as Markdown';
                    break;

                case 'get_url':
                    response = await cbbrowser.getUrl(options);
                    successMessage = 'Retrieved current URL';
                    break;

                case 'close':
                    await cbbrowser.close(options);
                    return {
                        llmContent: 'Browser closed successfully',
                        returnDisplay: 'Browser closed',
                    };

                case 'enter':
                    response = await cbbrowser.enter(options);
                    successMessage = 'Pressed Enter';
                    break;

                case 'search':
                    if (!this.params.element_id) {
                        return this.createError("'element_id' is required for search action");
                    }
                    if (!this.params.query) {
                        return this.createError("'query' is required for search action");
                    }
                    response = await cbbrowser.search(this.params.element_id, this.params.query, options);
                    successMessage = `Searched for: ${this.params.query}`;
                    break;

                default:
                    return this.createError(`Unknown action: ${action}`);
            }

            // Check for errors
            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Browser operation failed';
                return {
                    llmContent: `Browser ${action} failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            // Format output based on action
            let output = successMessage;

            if (action === 'get_url' && response.url) {
                output = `Current URL: ${response.url}`;
            } else if (action === 'get_content' && response.content) {
                output = `Page content:\n\n${this.truncate(response.content, 5000)}`;
            } else if (action === 'get_html' && response.html) {
                output = `HTML content:\n\n${this.truncate(response.html, 5000)}`;
            } else if (action === 'get_markdown' && response.markdown) {
                output = `Markdown content:\n\n${response.markdown}`;
            } else if (action === 'screenshot' && response.screenshot) {
                output = 'Screenshot captured successfully.\n\n[Screenshot data available]';
            } else if (response && response.result) {
                output += '\n\n' + (typeof response.result === 'string' ? response.result : JSON.stringify(response.result, null, 2));
            }

            return {
                llmContent: output,
                returnDisplay: successMessage,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error executing browser ${this.params.action}: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    private createError(message: string): ToolResult {
        return {
            llmContent: `Error: ${message}`,
            returnDisplay: `Error: ${message}`,
            error: {
                message,
                type: ToolErrorType.INVALID_TOOL_PARAMS,
            },
        };
    }

    private truncate(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '\n\n... (content truncated)';
    }
}

/**
 * Implementation of the BrowserAction tool logic
 */
export class BrowserActionTool extends BaseDeclarativeTool<
    BrowserActionToolParams,
    ToolResult
> {
    static readonly Name: string = 'browser_action';

    constructor() {
        super(
            BrowserActionTool.Name,
            'BrowserAction',
            `Performs browser automation actions like navigating to URLs, taking screenshots, clicking elements, typing text, scrolling, and extracting page content. Use this for web automation and scraping tasks.`,
            Kind.Execute,
            {
                properties: {
                    action: {
                        description:
                            "The browser action to perform: 'navigate', 'screenshot', 'click', 'type', 'scroll', 'get_content', 'get_html', 'get_markdown', 'get_url', 'close', 'enter', or 'search'.",
                        type: 'string',
                        enum: ['navigate', 'screenshot', 'click', 'type', 'scroll', 'get_content', 'get_html', 'get_markdown', 'get_url', 'close', 'enter', 'search'],
                    },
                    url: {
                        description:
                            "URL to navigate to (required for 'navigate' action).",
                        type: 'string',
                    },
                    element_id: {
                        description:
                            "Element ID to interact with (required for 'click', 'type', 'search' actions).",
                        type: 'string',
                    },
                    text: {
                        description:
                            "Text to type (required for 'type' action).",
                        type: 'string',
                    },
                    query: {
                        description:
                            "Search query (required for 'search' action).",
                        type: 'string',
                    },
                    direction: {
                        description:
                            "Scroll direction: 'up', 'down', 'left', 'right' (required for 'scroll' action).",
                        type: 'string',
                        enum: ['up', 'down', 'left', 'right'],
                    },
                    pixels: {
                        description:
                            "Number of pixels to scroll (required for 'scroll' action).",
                        type: 'string',
                    },
                    instance_id: {
                        description:
                            'Optional browser instance ID for multi-instance support.',
                        type: 'string',
                    },
                },
                required: ['action'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: BrowserActionToolParams,
    ): string | null {
        const validActions = ['navigate', 'screenshot', 'click', 'type', 'scroll', 'get_content', 'get_html', 'get_markdown', 'get_url', 'close', 'enter', 'search'];
        if (!validActions.includes(params.action)) {
            return `Invalid action: ${params.action}. Must be one of: ${validActions.join(', ')}`;
        }

        // Action-specific validation
        switch (params.action) {
            case 'navigate':
                if (!params.url) {
                    return "'url' is required for navigate action";
                }
                break;
            case 'click':
                if (!params.element_id) {
                    return "'element_id' is required for click action";
                }
                break;
            case 'type':
                if (!params.element_id) {
                    return "'element_id' is required for type action";
                }
                if (!params.text) {
                    return "'text' is required for type action";
                }
                break;
            case 'scroll':
                if (!params.direction) {
                    return "'direction' is required for scroll action";
                }
                if (!params.pixels) {
                    return "'pixels' is required for scroll action";
                }
                break;
            case 'search':
                if (!params.element_id) {
                    return "'element_id' is required for search action";
                }
                if (!params.query) {
                    return "'query' is required for search action";
                }
                break;
        }

        return null;
    }

    protected createInvocation(
        params: BrowserActionToolParams,
    ): ToolInvocation<BrowserActionToolParams, ToolResult> {
        return new BrowserActionToolInvocation(params);
    }
}
