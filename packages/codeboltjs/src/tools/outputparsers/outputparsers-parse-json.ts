import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cboutputparsers from '../../modules/outputparsers';

export interface OutputParsersParseJSONParams {
    jsonString: string;
}

class OutputParsersParseJSONInvocation extends BaseToolInvocation<OutputParsersParseJSONParams, ToolResult> {
    constructor(params: OutputParsersParseJSONParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const result = cboutputparsers.parseJSON(this.params.jsonString);
            if (!result.success) {
                return {
                    llmContent: `Error parsing JSON: ${result.error?.message}`,
                    returnDisplay: `Error parsing JSON: ${result.error?.message}`,
                    error: { message: result.error?.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `JSON parsed successfully: ${JSON.stringify(result.parsed)}`,
                returnDisplay: `Parsed JSON successfully`,
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

export class OutputParsersParseJSONTool extends BaseDeclarativeTool<OutputParsersParseJSONParams, ToolResult> {
    constructor() {
        super('outputparsers_parse_json', 'Parse JSON', 'Parse JSON string and return parsed data', Kind.Other, {
            type: 'object',
            properties: {
                jsonString: { type: 'string', description: 'The JSON string to parse' },
            },
            required: ['jsonString'],
        });
    }

    protected override createInvocation(params: OutputParsersParseJSONParams): ToolInvocation<OutputParsersParseJSONParams, ToolResult> {
        return new OutputParsersParseJSONInvocation(params);
    }
}
