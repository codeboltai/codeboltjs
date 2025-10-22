/**
 * Browser Action Tool - Performs browser automation actions
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { Kind } from '../types';
import type { ConfigManager } from '../config';

/**
 * Parameters for the BrowserAction tool
 */
export interface BrowserActionToolParams {
    /**
     * The browser action to perform
     */
    action: string;

    /**
     * URL for navigation actions
     */
    url?: string;

    /**
     * Coordinates for click action (e.g., '100,200')
     */
    coordinate?: string;

    /**
     * Text for input/type actions
     */
    text?: string;

    /**
     * Direction for scroll actions
     */
    direction?: string;

    /**
     * Number of pixels to scroll
     */
    pixels?: string;

    /**
     * Element index for click_element or input_text actions
     */
    index?: number;

    /**
     * Keys to send for send_keys action
     */
    keys?: string;

    /**
     * Number of seconds to wait
     */
    seconds?: number;

    /**
     * Extraction goal for extract_content action
     */
    goal?: string;

    /**
     * Whether to capture full page for screenshot
     */
    fullPage?: boolean;

    /**
     * CSS selector for various actions
     */
    selector?: string;
}

class BrowserActionToolInvocation extends BaseToolInvocation<
    BrowserActionToolParams,
    ToolResult
> {
    constructor(
        private readonly config: ConfigManager,
        params: BrowserActionToolParams,
    ) {
        super(params);
    }

    getDescription(): string {
        return `Performing browser action: ${this.params.action}`;
    }

    async execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<ToolResult> {
        try {
            // Import browserService to use existing logic
            const { browserService } = await import('../../cliLib/browserService');

            // Create finalMessage object similar to other tools
            const finalMessage = {
                threadId: 'codebolt-tools',
                agentInstanceId: 'codebolt-tools',
                agentId: 'codebolt-tools',
                parentAgentInstanceId: 'codebolt-tools',
                parentId: 'codebolt-tools',
                messageId: 'browser-action-tool'
            };

            // Use the browserService.executeTool method
            const result = await browserService.executeTool('browser_action', this.params, finalMessage);

            if (result && Array.isArray(result) && result[0] === false) {
                // Success case - browserService returns [false, result]
                return {
                    llmContent: typeof result[1] === 'string' ? result[1] : JSON.stringify(result[1]),
                    returnDisplay: typeof result[1] === 'string' ? result[1] : JSON.stringify(result[1])
                };
            } else if (result && result.success === false) {
                // Error case
                return {
                    llmContent: '',
                    returnDisplay: '',
                    error: {
                        type: ToolErrorType.EXECUTION_FAILED,
                        message: result.error || 'Browser action failed'
                    }
                };
            } else {
                // Handle other success formats
                const resultContent = typeof result === 'string' ? result : JSON.stringify(result);
                return {
                    llmContent: resultContent,
                    returnDisplay: resultContent
                };
            }
        } catch (error) {
            return {
                llmContent: '',
                returnDisplay: '',
                error: {
                    type: ToolErrorType.EXECUTION_FAILED,
                    message: `Failed to execute browser action: ${error.message || error}`
                }
            };
        }
    }
}

export class BrowserActionTool extends BaseDeclarativeTool<
    BrowserActionToolParams,
    ToolResult
> {
    static readonly Name: string = 'browser_action';

    constructor(private readonly config: ConfigManager) {
        super(
            BrowserActionTool.Name,
            'Browser Action',
            'A powerful browser automation tool that allows interaction with web pages through various actions. This tool provides commands for controlling a browser session, navigating web pages, and extracting information. It maintains state across calls, keeping the browser session alive until explicitly closed. Each action requires specific parameters as defined below.',
            Kind.Execute,
            {
                type: 'object',
                properties: {
                    action: {
                        type: 'string',
                        enum: [
                            'launch',
                            'go_to_url',
                            'go_back',
                            'go_forward',
                            'refresh',
                            'click',
                            'click_element',
                            'input_text',
                            'type',
                            'send_keys',
                            'scroll_down',
                            'scroll_up',
                            'scroll',
                            'scroll_to_text',
                            'wait',
                            'extract_content',
                            'get_current_state',
                            'getActionableElements',
                            'screenshot',
                            'getSnapShot',
                            'getBrowserInfo',
                            'getHtml',
                            'getHTML',
                            'getContent',
                            'getMarkdown',
                            'extractText',
                            'browserEnter',
                            'getPdf',
                            'getUrl',
                            'close'
                        ],
                        description: 'The browser action to perform. \'launch\' or \'go_to_url\' should be used first to navigate to a page, and \'close\' should be used last to clean up the session.'
                    },
                    url: {
                        type: 'string',
                        format: 'uri',
                        description: 'URL for \'launch\', \'go_to_url\' actions. Must include a valid protocol (http:// or https://).'
                    },
                    coordinate: {
                        type: 'string',
                        pattern: '^\\d+,\\d+$',
                        description: 'The x,y coordinates for the \'click\' action (e.g., \'100,200\'). Should be within the browser viewport dimensions.'
                    },
                    text: {
                        type: 'string',
                        description: 'Text for \'input_text\', \'type\', \'scroll_to_text\' actions. For input_text, this will be entered into the specified element index.'
                    },
                    direction: {
                        type: 'string',
                        enum: ['up', 'down', 'left', 'right', 'top', 'bottom'],
                        description: 'Scroll direction for \'scroll\' action. \'up\'/\'down\' for vertical scrolling, \'left\'/\'right\' for horizontal scrolling, \'top\'/\'bottom\' for absolute positioning.'
                    },
                    pixels: {
                        type: 'string',
                        description: 'Number of pixels to scroll for \'scroll\' action. Should be a numeric string (e.g., \'300\'). Ignored for \'top\' and \'bottom\' directions.'
                    },
                    index: {
                        type: 'integer',
                        description: 'Element index for \'click_element\' or \'input_text\' actions. Use \'get_current_state\' first to see available element indices.'
                    },
                    keys: {
                        type: 'string',
                        description: 'Keys to send for \'send_keys\' action (e.g., \'Enter\', \'Tab\', \'Escape\').'
                    },
                    seconds: {
                        type: 'integer',
                        description: 'Number of seconds to wait for \'wait\' action. Defaults to 3 if not specified.'
                    },
                    goal: {
                        type: 'string',
                        description: 'Extraction goal for \'extract_content\' action. Describe what specific information you want to extract from the page.'
                    },
                    fullPage: {
                        type: 'boolean',
                        description: 'Whether to capture the full page for \'screenshot\' action. Defaults to false (viewport only).'
                    }
                },
                required: ['action'],
                additionalProperties: false
            }
        );
    }

    protected override validateToolParamValues(
        params: BrowserActionToolParams,
    ): string | null {
        if (!params.action || params.action.trim() === '') {
            return 'Parameter "action" must be a non-empty string.';
        }

        // Validate action-specific required parameters
        switch (params.action) {
            case 'launch':
            case 'go_to_url':
                if (!params.url) {
                    return `Parameter "url" is required for action "${params.action}".`;
                }
                break;
            case 'click':
                if (!params.coordinate) {
                    return 'Parameter "coordinate" is required for click action.';
                }
                break;
            case 'click_element':
                if (params.index === undefined) {
                    return 'Parameter "index" is required for click_element action.';
                }
                break;
            case 'input_text':
                if (params.index === undefined || !params.text) {
                    return 'Parameters "index" and "text" are required for input_text action.';
                }
                break;
            case 'type':
                if (!params.text) {
                    return 'Parameter "text" is required for type action.';
                }
                break;
            case 'send_keys':
                if (!params.keys) {
                    return 'Parameter "keys" is required for send_keys action.';
                }
                break;
            case 'scroll':
                if (!params.direction || !params.pixels) {
                    return 'Parameters "direction" and "pixels" are required for scroll action.';
                }
                break;
            case 'scroll_to_text':
                if (!params.text) {
                    return 'Parameter "text" is required for scroll_to_text action.';
                }
                break;
            case 'extract_content':
                if (!params.goal) {
                    return 'Parameter "goal" is required for extract_content action.';
                }
                break;
            case 'wait':
                if (!params.seconds) {
                    return 'Parameter "seconds" is required for wait action.';
                }
                break;
        }

        return null;
    }

    protected createInvocation(params: BrowserActionToolParams) {
        return new BrowserActionToolInvocation(this.config, params);
    }
}
