/**
 * Test Run Get Tool - Retrieves a test run by ID
 * Wraps the SDK's cbautoTesting.getRun() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestRunGet tool
 */
export interface TestRunGetToolParams {
    /**
     * The ID of the test run to retrieve
     */
    run_id: string;
}

class TestRunGetToolInvocation extends BaseToolInvocation<
    TestRunGetToolParams,
    ToolResult
> {
    constructor(params: TestRunGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.getRun({
                id: this.params.run_id,
            });

            const run = response.payload?.run;

            if (!run) {
                return {
                    llmContent: `Error: Test run with ID '${this.params.run_id}' not found`,
                    returnDisplay: `Test run not found: ${this.params.run_id}`,
                    error: {
                        message: `Test run with ID '${this.params.run_id}' not found`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            // Calculate summary statistics
            const testCases = run.testCases || [];
            const statusCounts = {
                pending: 0,
                running: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
            };

            testCases.forEach(tc => {
                if (tc.status in statusCounts) {
                    statusCounts[tc.status as keyof typeof statusCounts]++;
                }
            });

            const testCaseInfo = testCases.map(tc =>
                `  - Case ${tc.testCaseId}: ${tc.status}${tc.userOverride ? ' (override)' : ''}`
            ).join('\n') || '  No test cases';

            const llmContent = `Test Run Details:
ID: ${run.id}
Name: ${run.name || 'N/A'}
Suite ID: ${run.testSuiteId}
Status: ${run.status}
Created: ${run.createdAt}
Updated: ${run.updatedAt}
Completed: ${run.completedAt || 'N/A'}

Summary:
- Total: ${testCases.length}
- Passed: ${statusCounts.passed}
- Failed: ${statusCounts.failed}
- Pending: ${statusCounts.pending}
- Running: ${statusCounts.running}
- Skipped: ${statusCounts.skipped}

Test Cases:
${testCaseInfo}`;

            return {
                llmContent,
                returnDisplay: `Retrieved test run: ${run.name || run.id} (${run.status})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving test run: ${errorMessage}`,
                returnDisplay: `Error retrieving test run: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestRunGet tool logic
 */
export class TestRunGetTool extends BaseDeclarativeTool<
    TestRunGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_run_get';

    constructor() {
        super(
            TestRunGetTool.Name,
            'TestRunGet',
            'Retrieves a test run by its ID, including status, test case results, and summary statistics.',
            Kind.Read,
            {
                properties: {
                    run_id: {
                        description: 'The ID of the test run to retrieve.',
                        type: 'string',
                    },
                },
                required: ['run_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestRunGetToolParams,
    ): string | null {
        if (!params.run_id || params.run_id.trim() === '') {
            return "The 'run_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: TestRunGetToolParams,
    ): ToolInvocation<TestRunGetToolParams, ToolResult> {
        return new TestRunGetToolInvocation(params);
    }
}
