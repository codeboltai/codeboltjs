/**
 * Test Run Create Tool - Creates a new test run
 * Wraps the SDK's cbautoTesting.createRun() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestRunCreate tool
 */
export interface TestRunCreateToolParams {
    /**
     * The ID of the test suite to run
     */
    test_suite_id: string;

    /**
     * Optional name for the test run
     */
    name?: string;
}

class TestRunCreateToolInvocation extends BaseToolInvocation<
    TestRunCreateToolParams,
    ToolResult
> {
    constructor(params: TestRunCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.createRun({
                testSuiteId: this.params.test_suite_id,
                name: this.params.name,
            });

            const run = response.payload?.run;
            if (!run) {
                return {
                    llmContent: 'Error creating test run: No run returned in response',
                    returnDisplay: 'Error creating test run: No run returned',
                    error: {
                        message: 'No run returned in response',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully created test run:\nID: ${run.id}\nName: ${run.name || 'N/A'}\nSuite ID: ${run.testSuiteId}\nStatus: ${run.status}\nTest Cases: ${run.testCases?.length || 0}\nCreated: ${run.createdAt}`,
                returnDisplay: `Created test run: ${run.name || run.id} (Status: ${run.status})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating test run: ${errorMessage}`,
                returnDisplay: `Error creating test run: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestRunCreate tool logic
 */
export class TestRunCreateTool extends BaseDeclarativeTool<
    TestRunCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_run_create';

    constructor() {
        super(
            TestRunCreateTool.Name,
            'TestRunCreate',
            'Creates a new test run for a specified test suite. A test run tracks the execution and results of all test cases in the suite.',
            Kind.Execute,
            {
                properties: {
                    test_suite_id: {
                        description: 'The ID of the test suite to create a run for.',
                        type: 'string',
                    },
                    name: {
                        description: 'Optional name for the test run (e.g., "Sprint 1 Regression").',
                        type: 'string',
                    },
                },
                required: ['test_suite_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestRunCreateToolParams,
    ): string | null {
        if (!params.test_suite_id || params.test_suite_id.trim() === '') {
            return "The 'test_suite_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: TestRunCreateToolParams,
    ): ToolInvocation<TestRunCreateToolParams, ToolResult> {
        return new TestRunCreateToolInvocation(params);
    }
}
