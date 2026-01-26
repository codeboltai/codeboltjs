import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cboutputparsers from '../../modules/outputparsers';

export interface OutputParsersParseWarningsParams {
    output: string;
}

class OutputParsersParseWarningsInvocation extends BaseToolInvocation<OutputParsersParseWarningsParams, ToolResult> {
    constructor(params: OutputParsersParseWarningsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const warnings = cboutputparsers.parseWarnings(this.params.output);
            return {
                llmContent: `Found ${warnings.length} warnings: ${JSON.stringify(warnings)}`,
                returnDisplay: `Found ${warnings.length} warning messages`,
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

export class OutputParsersParseWarningsTool extends BaseDeclarativeTool<OutputParsersParseWarningsParams, ToolResult> {
    constructor() {
        super('outputparsers_parse_warnings', 'Parse Warnings', 'Parse output and extract warning messages', Kind.Other, {
            type: 'object',
            properties: {
                output: { type: 'string', description: 'The output to parse for warning messages' },
            },
            required: ['output'],
        });
    }

    protected override createInvocation(params: OutputParsersParseWarningsParams): ToolInvocation<OutputParsersParseWarningsParams, ToolResult> {
        return new OutputParsersParseWarningsInvocation(params);
    }
}
