import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cboutputparsers from '../../modules/outputparsers';

export interface OutputParsersParseErrorsParams {
    output: string;
}

class OutputParsersParseErrorsInvocation extends BaseToolInvocation<OutputParsersParseErrorsParams, ToolResult> {
    constructor(params: OutputParsersParseErrorsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const errors = cboutputparsers.parseErrors(this.params.output);
            return {
                llmContent: `Found ${errors.length} errors: ${JSON.stringify(errors)}`,
                returnDisplay: `Found ${errors.length} error messages`,
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

export class OutputParsersParseErrorsTool extends BaseDeclarativeTool<OutputParsersParseErrorsParams, ToolResult> {
    constructor() {
        super('outputparsers_parse_errors', 'Parse Errors', 'Parse output and extract error messages', Kind.Other, {
            type: 'object',
            properties: {
                output: { type: 'string', description: 'The output to parse for error messages' },
            },
            required: ['output'],
        });
    }

    protected override createInvocation(params: OutputParsersParseErrorsParams): ToolInvocation<OutputParsersParseErrorsParams, ToolResult> {
        return new OutputParsersParseErrorsInvocation(params);
    }
}
