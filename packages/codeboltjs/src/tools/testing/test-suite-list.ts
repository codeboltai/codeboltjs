/**
 * Test Suite List Tool - Lists all test suites
 * Wraps the SDK's cbautoTesting.listSuites() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestSuiteList tool
 */
export interface TestSuiteListToolParams {
    /**
     * Optional filters for listing suites (reserved for future use)
     */
    filters?: Record<string, unknown>;
}

class TestSuiteListToolInvocation extends BaseToolInvocation<
    TestSuiteListToolParams,
    ToolResult
> {
    constructor(params: TestSuiteListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.listSuites(this.params.filters);

            const suites = response.payload?.suites || [];

            if (suites.length === 0) {
                return {
                    llmContent: 'No test suites found.',
                    returnDisplay: 'No test suites found',
                };
            }

            const suiteList = suites.map(suite =>
                `- ${suite.name} (ID: ${suite.id})\n  Description: ${suite.description || 'N/A'}\n  Test Cases: ${suite.testCaseIds?.length || 0}`
            ).join('\n\n');

            return {
                llmContent: `Found ${suites.length} test suite(s):\n\n${suiteList}`,
                returnDisplay: `Listed ${suites.length} test suite(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing test suites: ${errorMessage}`,
                returnDisplay: `Error listing test suites: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestSuiteList tool logic
 */
export class TestSuiteListTool extends BaseDeclarativeTool<
    TestSuiteListToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_suite_list';

    constructor() {
        super(
            TestSuiteListTool.Name,
            'TestSuiteList',
            'Lists all available test suites with their names, descriptions, and test case counts.',
            Kind.Read,
            {
                properties: {
                    filters: {
                        description: 'Optional filters for listing suites (reserved for future use).',
                        type: 'object',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: TestSuiteListToolParams,
    ): ToolInvocation<TestSuiteListToolParams, ToolResult> {
        return new TestSuiteListToolInvocation(params);
    }
}
