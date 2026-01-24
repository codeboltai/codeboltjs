/**
 * Tokenizer Get Tool - Retrieves a token from the system
 * Wraps the SDK's tokenizer.getToken() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import tokenizer from '../../modules/tokenizer';

export interface TokenizerGetParams {
    /** The key associated with the token to be retrieved */
    key: string;
}

class TokenizerGetInvocation extends BaseToolInvocation<TokenizerGetParams, ToolResult> {
    constructor(params: TokenizerGetParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await tokenizer.getToken(this.params.key);

            if (!response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Failed to get token';
                return {
                    llmContent: `Failed to get token: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `Token retrieved for key: ${this.params.key}`;
            const resp = response as any;
            if (resp.token) {
                output += `\n\nToken: ${resp.token}`;
            } else if (resp.data) {
                output += `\n\nData: ${typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data, null, 2)}`;
            } else if (resp.value) {
                output += `\n\nValue: ${resp.value}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Token retrieved for key: ${this.params.key}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting token: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class TokenizerGetTool extends BaseDeclarativeTool<TokenizerGetParams, ToolResult> {
    static readonly Name: string = 'tokenizer_get';

    constructor() {
        super(
            TokenizerGetTool.Name,
            'TokenizerGet',
            'Retrieves a token from the system using the specified key.',
            Kind.Read,
            {
                properties: {
                    key: {
                        description: 'The key associated with the token to be retrieved.',
                        type: 'string',
                    },
                },
                required: ['key'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: TokenizerGetParams): string | null {
        if (!params.key || params.key.trim() === '') {
            return "'key' is required for getting a token";
        }
        return null;
    }

    protected createInvocation(params: TokenizerGetParams): ToolInvocation<TokenizerGetParams, ToolResult> {
        return new TokenizerGetInvocation(params);
    }
}
