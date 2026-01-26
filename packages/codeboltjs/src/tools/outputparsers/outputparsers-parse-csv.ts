import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cboutputparsers from '../../modules/outputparsers';

export interface OutputParsersParseCSVParams {
    csvString: string;
}

class OutputParsersParseCSVInvocation extends BaseToolInvocation<OutputParsersParseCSVParams, ToolResult> {
    constructor(params: OutputParsersParseCSVParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const result = cboutputparsers.parseCSV(this.params.csvString);
            if (!result.success) {
                return {
                    llmContent: `Error parsing CSV: ${result.error?.message}`,
                    returnDisplay: `Error parsing CSV: ${result.error?.message}`,
                    error: { message: result.error?.message || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `CSV parsed successfully: ${JSON.stringify(result.parsed)}`,
                returnDisplay: `Parsed CSV with ${result.parsed?.length || 0} rows`,
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

export class OutputParsersParseCSVTool extends BaseDeclarativeTool<OutputParsersParseCSVParams, ToolResult> {
    constructor() {
        super('outputparsers_parse_csv', 'Parse CSV', 'Parse CSV string and return parsed data', Kind.Other, {
            type: 'object',
            properties: {
                csvString: { type: 'string', description: 'The CSV string to parse' },
            },
            required: ['csvString'],
        });
    }

    protected override createInvocation(params: OutputParsersParseCSVParams): ToolInvocation<OutputParsersParseCSVParams, ToolResult> {
        return new OutputParsersParseCSVInvocation(params);
    }
}
