/**
 * Browser Type Tool - Types text into an element
 * Wraps the SDK's cbbrowser.type() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbbrowser from '../../modules/browser';
import cbchat from '../../modules/chat';

export interface BrowserTypeParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    /** The element ID to type into */
    element_id: string;
    /** The text to type */
    text: string;
    /** Optional browser instance ID */
    instance_id?: string;
}

class BrowserTypeInvocation extends BaseToolInvocation<BrowserTypeParams, ToolResult> {
    constructor(params: BrowserTypeParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const options = this.params.instance_id ? { instanceId: this.params.instance_id } : undefined;
            const response = await cbbrowser.type(this.params.element_id, this.params.text, options);

            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Type failed';
                return {
                    llmContent: `Type failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.BROWSER_EXECUTION_ERROR,
                    },
                };
            }

            return {
                llmContent: `Typed text into element: ${this.params.element_id}`,
                returnDisplay: `Typed text into element: ${this.params.element_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error typing text: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class BrowserTypeTool extends BaseDeclarativeTool<BrowserTypeParams, ToolResult> {
    static readonly Name: string = 'browser_type';

    constructor() {
        super(
            BrowserTypeTool.Name,
            'BrowserType',
            'Types text into an element in the browser page.',
            Kind.Execute,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    element_id: {
                        description: 'The ID of the element to type into.',
                        type: 'string',
                    },
                    text: {
                        description: 'The text to type.',
                        type: 'string',
                    },
                    instance_id: {
                        description: 'Optional browser instance ID for multi-instance support.',
                        type: 'string',
                    },
                },
                required: ['element_id', 'text'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: BrowserTypeParams): string | null {
        if (!params.element_id || params.element_id.trim() === '') {
            return "'element_id' is required for type";
        }
        if (params.text === undefined || params.text === null) {
            return "'text' is required for type";
        }
        return null;
    }

    protected createInvocation(params: BrowserTypeParams): ToolInvocation<BrowserTypeParams, ToolResult> {
        return new BrowserTypeInvocation(params);
    }
}
