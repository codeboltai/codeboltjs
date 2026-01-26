import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cboutputparsers from '../../modules/outputparsers';

export interface OutputParsersParseXMLParams {
    xmlString: string;
}

class OutputParsersParseXMLInvocation extends BaseToolInvocation<OutputParsersParseXMLParams, ToolResult> {
    constructor(params: OutputParsersParseXMLParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const result = cboutputparsers.parseXML(this.params.xmlString);
            if (!result.success) {
                return {
                    llmContent: `Error parsing XML: Invalid XML format`,
                    returnDisplay: `Error parsing XML: Invalid XML format`,
                    error: { message: 'Invalid XML format', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `XML parsed successfully: ${JSON.stringify(result.parsed)}`,
                returnDisplay: `Parsed XML successfully`,
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

export class OutputParsersParseXMLTool extends BaseDeclarativeTool<OutputParsersParseXMLParams, ToolResult> {
    constructor() {
        super('outputparsers_parse_xml', 'Parse XML', 'Parse XML string and return parsed data', Kind.Other, {
            type: 'object',
            properties: {
                xmlString: { type: 'string', description: 'The XML string to parse' },
            },
            required: ['xmlString'],
        });
    }

    protected override createInvocation(params: OutputParsersParseXMLParams): ToolInvocation<OutputParsersParseXMLParams, ToolResult> {
        return new OutputParsersParseXMLInvocation(params);
    }
}
