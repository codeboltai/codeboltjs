/**
 * Test Suite Create Tool - Creates a new test suite
 * Wraps the SDK's cbautoTesting.createSuite() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestSuiteCreate tool
 */
export interface TestSuiteCreateToolParams {
    /**
     * The name of the test suite
     */
    name: string;

    /**
     * Optional description of the test suite
     */
    description?: string;

    /**
     * Optional array of test case IDs to include in the suite
     */
    test_case_ids?: string[];
}

class TestSuiteCreateToolInvocation extends BaseToolInvocation<
    TestSuiteCreateToolParams,
    ToolResult
> {
    constructor(params: TestSuiteCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.createSuite({
                name: this.params.name,
                description: this.params.description,
                testCaseIds: this.params.test_case_ids,
            });

            const suite = response.payload?.suite;
            if (!suite) {
                return {
                    llmContent: 'Error creating test suite: No suite returned in response',
                    returnDisplay: 'Error creating test suite: No suite returned',
                    error: {
                        message: 'No suite returned in response',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully created test suite:\nID: ${suite.id}\nName: ${suite.name}\nDescription: ${suite.description || 'N/A'}\nTest Cases: ${suite.testCaseIds?.length || 0}`,
                returnDisplay: `Created test suite: ${suite.name} (ID: ${suite.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating test suite: ${errorMessage}`,
                returnDisplay: `Error creating test suite: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestSuiteCreate tool logic
 */
export class TestSuiteCreateTool extends BaseDeclarativeTool<
    TestSuiteCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_suite_create';

    constructor() {
        super(
            TestSuiteCreateTool.Name,
            'TestSuiteCreate',
            'Creates a new test suite with the specified name and optional description. Test suites are used to group related test cases together.',
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name of the test suite to create.',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the test suite.',
                        type: 'string',
                    },
                    test_case_ids: {
                        description: 'Optional array of test case IDs to include in the suite.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['name'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestSuiteCreateToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: TestSuiteCreateToolParams,
    ): ToolInvocation<TestSuiteCreateToolParams, ToolResult> {
        return new TestSuiteCreateToolInvocation(params);
    }
}
