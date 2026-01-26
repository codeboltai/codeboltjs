/**
 * CodeUtils Match Detail Tool - Gets matcher details
 * Wraps the SDK's cbcodeutils.matchDetail() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeutils from '../../modules/codeutils';

export interface CodeUtilsMatchDetailParams {
    matcher: string;
}

class CodeUtilsMatchDetailInvocation extends BaseToolInvocation<CodeUtilsMatchDetailParams, ToolResult> {
    constructor(params: CodeUtilsMatchDetailParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { matcher } = this.params;
            const response = await cbcodeutils.matchDetail(matcher);

            const result = response ? JSON.stringify(response, null, 2) : 'No matcher details found';

            return {
                llmContent: result,
                returnDisplay: `Matcher details retrieved for: ${matcher}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting matcher details: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class CodeUtilsMatchDetailTool extends BaseDeclarativeTool<CodeUtilsMatchDetailParams, ToolResult> {
    static readonly Name: string = 'codeutils_match_detail';

    constructor() {
        super(
            CodeUtilsMatchDetailTool.Name,
            'CodeUtilsMatchDetail',
            'Retrieves details of a specific matcher by name or identifier.',
            Kind.Read,
            {
                properties: {
                    matcher: {
                        type: 'string',
                        description: 'The matcher name or identifier to retrieve details for',
                    },
                },
                required: ['matcher'],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: CodeUtilsMatchDetailParams): ToolInvocation<CodeUtilsMatchDetailParams, ToolResult> {
        return new CodeUtilsMatchDetailInvocation(params);
    }
}
