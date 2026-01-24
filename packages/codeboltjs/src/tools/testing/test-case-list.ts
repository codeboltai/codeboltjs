/**
 * Test Case List Tool - Lists all test cases
 * Wraps the SDK's cbautoTesting.listCases() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestCaseList tool
 */
export interface TestCaseListToolParams {
    /**
     * Optional suite ID to filter test cases by suite
     */
    suite_id?: string;

    /**
     * Optional filters for listing cases (reserved for future use)
     */
    filters?: Record<string, unknown>;
}

class TestCaseListToolInvocation extends BaseToolInvocation<
    TestCaseListToolParams,
    ToolResult
> {
    constructor(params: TestCaseListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.listCases(this.params.filters);

            const cases = response.payload?.cases || [];

            if (cases.length === 0) {
                return {
                    llmContent: 'No test cases found.',
                    returnDisplay: 'No test cases found',
                };
            }

            const caseList = cases.map(tc =>
                `- [${tc.key}] ${tc.name} (ID: ${tc.id})\n  Priority: ${tc.priority || 'N/A'} | Steps: ${tc.steps?.length || 0} | Labels: ${tc.labels?.join(', ') || 'None'}`
            ).join('\n\n');

            return {
                llmContent: `Found ${cases.length} test case(s):\n\n${caseList}`,
                returnDisplay: `Listed ${cases.length} test case(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing test cases: ${errorMessage}`,
                returnDisplay: `Error listing test cases: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestCaseList tool logic
 */
export class TestCaseListTool extends BaseDeclarativeTool<
    TestCaseListToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_case_list';

    constructor() {
        super(
            TestCaseListTool.Name,
            'TestCaseList',
            'Lists all available test cases with their keys, names, priorities, and step counts.',
            Kind.Read,
            {
                properties: {
                    suite_id: {
                        description: 'Optional suite ID to filter test cases by suite.',
                        type: 'string',
                    },
                    filters: {
                        description: 'Optional filters for listing cases (reserved for future use).',
                        type: 'object',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: TestCaseListToolParams,
    ): ToolInvocation<TestCaseListToolParams, ToolResult> {
        return new TestCaseListToolInvocation(params);
    }
}
