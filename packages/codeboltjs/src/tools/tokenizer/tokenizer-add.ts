/**
 * Tokenizer Add Tool - Adds a token to the system
 * Wraps the SDK's tokenizer.addToken() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import tokenizer from '../../modules/tokenizer';

export interface TokenizerAddParams {
    /** The key associated with the token to be added */
    key: string;
}

class TokenizerAddInvocation extends BaseToolInvocation<TokenizerAddParams, ToolResult> {
    constructor(params: TokenizerAddParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await tokenizer.addToken(this.params.key);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to add token';
                return {
                    llmContent: `Failed to add token: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Token added successfully with key: ${this.params.key}`;
            if (response.message) {
                output += '\n\n' + response.message;
            }

            return {
                llmContent: output,
                returnDisplay: `Token added with key: ${this.params.key}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding token: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TokenizerAddTool extends BaseDeclarativeTool<TokenizerAddParams, ToolResult> {
    static readonly Name: string = 'tokenizer_add';

    constructor() {
        super(
            TokenizerAddTool.Name,
            'TokenizerAdd',
            'Adds a token to the system with the specified key.',
            Kind.Edit,
            {
                properties: {
                    key: {
                        description: 'The key associated with the token to be added.',
                        type: 'string',
                    },
                },
                required: ['key'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: TokenizerAddParams): string | null {
        if (!params.key || params.key.trim() === '') {
            return "'key' is required for adding a token";
        }
        return null;
    }

    protected createInvocation(params: TokenizerAddParams): ToolInvocation<TokenizerAddParams, ToolResult> {
        return new TokenizerAddInvocation(params);
    }
}
