/**
 * CodeUtils Perform Match Tool - Performs pattern matching
 * Wraps the SDK's cbcodeutils.performMatch() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeutils from '../../modules/codeutils';

export interface CodeUtilsPerformMatchParams {
    matcher_definition: object;
    problem_patterns: any[];
    problems?: any[];
}

class CodeUtilsPerformMatchInvocation extends BaseToolInvocation<CodeUtilsPerformMatchParams, ToolResult> {
    constructor(params: CodeUtilsPerformMatchParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { matcher_definition, problem_patterns, problems = [] } = this.params;
            const response = await cbcodeutils.performMatch(matcher_definition, problem_patterns, problems);

            const result = response ? JSON.stringify(response, null, 2) : 'No matches found';

            return {
                llmContent: result,
                returnDisplay: 'Pattern matching completed',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error performing match: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class CodeUtilsPerformMatchTool extends BaseDeclarativeTool<CodeUtilsPerformMatchParams, ToolResult> {
    static readonly Name: string = 'codeutils_perform_match';

    constructor() {
        super(
            CodeUtilsPerformMatchTool.Name,
            'CodeUtilsPerformMatch',
            'Performs a matching operation based on the provided matcher definition and problem patterns.',
            Kind.Read,
            {
                properties: {
                    matcher_definition: {
                        type: 'object',
                        description: 'The definition of the matcher (name, pattern, language, etc.)',
                    },
                    problem_patterns: {
                        type: 'array',
                        description: 'The patterns to match against (regex patterns with severity levels)',
                        items: {
                            type: 'object',
                        },
                    },
                    problems: {
                        type: 'array',
                        description: 'Optional list of pre-existing problems to include',
                        items: {
                            type: 'object',
                        },
                    },
                },
                required: ['matcher_definition', 'problem_patterns'],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: CodeUtilsPerformMatchParams): ToolInvocation<CodeUtilsPerformMatchParams, ToolResult> {
        return new CodeUtilsPerformMatchInvocation(params);
    }
}
