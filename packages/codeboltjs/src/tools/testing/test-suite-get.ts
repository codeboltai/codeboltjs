/**
 * Test Suite Get Tool - Retrieves a test suite by ID
 * Wraps the SDK's cbautoTesting.getSuite() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestSuiteGet tool
 */
export interface TestSuiteGetToolParams {
    /**
     * The ID of the test suite to retrieve
     */
    suite_id: string;
}

class TestSuiteGetToolInvocation extends BaseToolInvocation<
    TestSuiteGetToolParams,
    ToolResult
> {
    constructor(params: TestSuiteGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.getSuite({
                id: this.params.suite_id,
            });

            const suite = response.payload?.suite;
            const testCases = response.payload?.testCases || [];

            if (!suite) {
                return {
                    llmContent: `Error: Test suite with ID '${this.params.suite_id}' not found`,
                    returnDisplay: `Test suite not found: ${this.params.suite_id}`,
                    error: {
                        message: `Test suite with ID '${this.params.suite_id}' not found`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const testCaseInfo = testCases.map(tc => `  - ${tc.name} (ID: ${tc.id})`).join('\n');
            const llmContent = `Test Suite Details:
ID: ${suite.id}
Name: ${suite.name}
Description: ${suite.description || 'N/A'}
Created: ${suite.createdAt}
Updated: ${suite.updatedAt}
Test Cases (${testCases.length}):
${testCaseInfo || '  No test cases'}`;

            return {
                llmContent,
                returnDisplay: `Retrieved test suite: ${suite.name} (${testCases.length} test cases)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving test suite: ${errorMessage}`,
                returnDisplay: `Error retrieving test suite: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestSuiteGet tool logic
 */
export class TestSuiteGetTool extends BaseDeclarativeTool<
    TestSuiteGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_suite_get';

    constructor() {
        super(
            TestSuiteGetTool.Name,
            'TestSuiteGet',
            'Retrieves a test suite by its ID, including its associated test cases.',
            Kind.Read,
            {
                properties: {
                    suite_id: {
                        description: 'The ID of the test suite to retrieve.',
                        type: 'string',
                    },
                },
                required: ['suite_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestSuiteGetToolParams,
    ): string | null {
        if (!params.suite_id || params.suite_id.trim() === '') {
            return "The 'suite_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: TestSuiteGetToolParams,
    ): ToolInvocation<TestSuiteGetToolParams, ToolResult> {
        return new TestSuiteGetToolInvocation(params);
    }
}
