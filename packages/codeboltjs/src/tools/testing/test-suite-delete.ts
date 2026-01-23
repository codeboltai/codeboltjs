/**
 * Test Suite Delete Tool - Deletes a test suite
 * Wraps the SDK's cbautoTesting.deleteSuite() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestSuiteDelete tool
 */
export interface TestSuiteDeleteToolParams {
    /**
     * The ID of the test suite to delete
     */
    suite_id: string;
}

class TestSuiteDeleteToolInvocation extends BaseToolInvocation<
    TestSuiteDeleteToolParams,
    ToolResult
> {
    constructor(params: TestSuiteDeleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.deleteSuite({
                id: this.params.suite_id,
            });

            const payload = response.payload;
            const success = payload && ('ok' in payload ? payload.ok : 'suiteId' in payload);

            if (!success) {
                return {
                    llmContent: `Error deleting test suite: Suite with ID '${this.params.suite_id}' not found or deletion failed`,
                    returnDisplay: `Error deleting test suite: ${this.params.suite_id}`,
                    error: {
                        message: `Suite with ID '${this.params.suite_id}' not found or deletion failed`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted test suite with ID: ${this.params.suite_id}`,
                returnDisplay: `Deleted test suite: ${this.params.suite_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting test suite: ${errorMessage}`,
                returnDisplay: `Error deleting test suite: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestSuiteDelete tool logic
 */
export class TestSuiteDeleteTool extends BaseDeclarativeTool<
    TestSuiteDeleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_suite_delete';

    constructor() {
        super(
            TestSuiteDeleteTool.Name,
            'TestSuiteDelete',
            'Permanently deletes a test suite by its ID. This action cannot be undone.',
            Kind.Delete,
            {
                properties: {
                    suite_id: {
                        description: 'The ID of the test suite to delete.',
                        type: 'string',
                    },
                },
                required: ['suite_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestSuiteDeleteToolParams,
    ): string | null {
        if (!params.suite_id || params.suite_id.trim() === '') {
            return "The 'suite_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: TestSuiteDeleteToolParams,
    ): ToolInvocation<TestSuiteDeleteToolParams, ToolResult> {
        return new TestSuiteDeleteToolInvocation(params);
    }
}
