/**
 * Test Suite Update Tool - Updates an existing test suite
 * Wraps the SDK's cbautoTesting.updateSuite() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestSuiteUpdate tool
 */
export interface TestSuiteUpdateToolParams {
    /**
     * The ID of the test suite to update
     */
    suite_id: string;

    /**
     * Optional new name for the test suite
     */
    name?: string;

    /**
     * Optional new description for the test suite
     */
    description?: string;

    /**
     * Optional new array of test case IDs
     */
    test_case_ids?: string[];
}

class TestSuiteUpdateToolInvocation extends BaseToolInvocation<
    TestSuiteUpdateToolParams,
    ToolResult
> {
    constructor(params: TestSuiteUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.updateSuite({
                id: this.params.suite_id,
                name: this.params.name,
                description: this.params.description,
                testCaseIds: this.params.test_case_ids,
            });

            const suite = response.payload?.suite;
            if (!suite) {
                return {
                    llmContent: `Error updating test suite: Suite with ID '${this.params.suite_id}' not found or update failed`,
                    returnDisplay: `Error updating test suite: ${this.params.suite_id}`,
                    error: {
                        message: `Suite with ID '${this.params.suite_id}' not found or update failed`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated test suite:\nID: ${suite.id}\nName: ${suite.name}\nDescription: ${suite.description || 'N/A'}\nTest Cases: ${suite.testCaseIds?.length || 0}`,
                returnDisplay: `Updated test suite: ${suite.name} (ID: ${suite.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating test suite: ${errorMessage}`,
                returnDisplay: `Error updating test suite: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestSuiteUpdate tool logic
 */
export class TestSuiteUpdateTool extends BaseDeclarativeTool<
    TestSuiteUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_suite_update';

    constructor() {
        super(
            TestSuiteUpdateTool.Name,
            'TestSuiteUpdate',
            'Updates an existing test suite with new name, description, or test case associations.',
            Kind.Edit,
            {
                properties: {
                    suite_id: {
                        description: 'The ID of the test suite to update.',
                        type: 'string',
                    },
                    name: {
                        description: 'Optional new name for the test suite.',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional new description for the test suite.',
                        type: 'string',
                    },
                    test_case_ids: {
                        description: 'Optional new array of test case IDs to associate with the suite.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['suite_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestSuiteUpdateToolParams,
    ): string | null {
        if (!params.suite_id || params.suite_id.trim() === '') {
            return "The 'suite_id' parameter must be non-empty.";
        }

        // Ensure at least one update field is provided
        if (!params.name && !params.description && !params.test_case_ids) {
            return 'At least one of name, description, or test_case_ids must be provided for update.';
        }

        return null;
    }

    protected createInvocation(
        params: TestSuiteUpdateToolParams,
    ): ToolInvocation<TestSuiteUpdateToolParams, ToolResult> {
        return new TestSuiteUpdateToolInvocation(params);
    }
}
