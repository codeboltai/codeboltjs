import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cboutputparsers from '../../modules/outputparsers';

export interface OutputParsersParseTextParams {
    text: string;
}

class OutputParsersParseTextInvocation extends BaseToolInvocation<OutputParsersParseTextParams, ToolResult> {
    constructor(params: OutputParsersParseTextParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const result = cboutputparsers.parseText(this.params.text);
            if (!result.success) {
                return {
                    llmContent: `Error parsing text`,
                    returnDisplay: `Error parsing text`,
                    error: { message: 'Failed to parse text', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Text parsed successfully: ${result.parsed?.length || 0} lines`,
                returnDisplay: `Parsed text into ${result.parsed?.length || 0} lines`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class OutputParsersParseTextTool extends BaseDeclarativeTool<OutputParsersParseTextParams, ToolResult> {
    constructor() {
        super('outputparsers_parse_text', 'Parse Text', 'Parse text string and return lines', Kind.Other, {
            type: 'object',
            properties: {
                text: { type: 'string', description: 'The text to parse' },
            },
            required: ['text'],
        });
    }

    protected override createInvocation(params: OutputParsersParseTextParams): ToolInvocation<OutputParsersParseTextParams, ToolResult> {
        return new OutputParsersParseTextInvocation(params);
    }
}
