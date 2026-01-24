/**
 * CodeUtils Get Matcher List Tool - Gets list of matchers
 * Wraps the SDK's cbcodeutils.getMatcherList() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeutils from '../../modules/codeutils';

export interface CodeUtilsGetMatcherListParams {
    // No required parameters
}

class CodeUtilsGetMatcherListInvocation extends BaseToolInvocation<CodeUtilsGetMatcherListParams, ToolResult> {
    constructor(params: CodeUtilsGetMatcherListParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbcodeutils.getMatcherList();

            const result = response ? JSON.stringify(response, null, 2) : 'No matchers found';

            return {
                llmContent: result,
                returnDisplay: 'Matcher list retrieved',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting matcher list: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class CodeUtilsGetMatcherListTool extends BaseDeclarativeTool<CodeUtilsGetMatcherListParams, ToolResult> {
    static readonly Name: string = 'codeutils_get_matcher_list';

    constructor() {
        super(
            CodeUtilsGetMatcherListTool.Name,
            'CodeUtilsGetMatcherList',
            'Retrieves the list of available matchers.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: CodeUtilsGetMatcherListParams): ToolInvocation<CodeUtilsGetMatcherListParams, ToolResult> {
        return new CodeUtilsGetMatcherListInvocation(params);
    }
}
