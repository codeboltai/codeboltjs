/**
 * Test Run Update Status Tool - Updates the status of a test run
 * Wraps the SDK's cbautoTesting.updateRunStatus() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestRunUpdateStatus tool
 */
export interface TestRunUpdateStatusToolParams {
    /**
     * The ID of the test run to update
     */
    run_id: string;

    /**
     * The new status for the test run
     */
    status: 'pending' | 'running' | 'completed' | 'cancelled';
}

class TestRunUpdateStatusToolInvocation extends BaseToolInvocation<
    TestRunUpdateStatusToolParams,
    ToolResult
> {
    constructor(params: TestRunUpdateStatusToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.updateRunStatus({
                runId: this.params.run_id,
                status: this.params.status,
            });

            const run = response.payload?.run;
            if (!run) {
                return {
                    llmContent: `Error updating test run status: Run with ID '${this.params.run_id}' not found or update failed`,
                    returnDisplay: `Error updating test run status: ${this.params.run_id}`,
                    error: {
                        message: `Run with ID '${this.params.run_id}' not found or update failed`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated test run status:\nID: ${run.id}\nName: ${run.name || 'N/A'}\nNew Status: ${run.status}\nUpdated: ${run.updatedAt}${run.completedAt ? `\nCompleted: ${run.completedAt}` : ''}`,
                returnDisplay: `Updated test run ${run.id} status to: ${run.status}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating test run status: ${errorMessage}`,
                returnDisplay: `Error updating test run status: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestRunUpdateStatus tool logic
 */
export class TestRunUpdateStatusTool extends BaseDeclarativeTool<
    TestRunUpdateStatusToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_run_update_status';

    constructor() {
        super(
            TestRunUpdateStatusTool.Name,
            'TestRunUpdateStatus',
            'Updates the status of a test run. Use this to mark a run as running, completed, or cancelled.',
            Kind.Edit,
            {
                properties: {
                    run_id: {
                        description: 'The ID of the test run to update.',
                        type: 'string',
                    },
                    status: {
                        description: 'The new status for the test run: pending, running, completed, or cancelled.',
                        type: 'string',
                        enum: ['pending', 'running', 'completed', 'cancelled'],
                    },
                },
                required: ['run_id', 'status'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestRunUpdateStatusToolParams,
    ): string | null {
        if (!params.run_id || params.run_id.trim() === '') {
            return "The 'run_id' parameter must be non-empty.";
        }

        const validStatuses = ['pending', 'running', 'completed', 'cancelled'];
        if (!params.status || !validStatuses.includes(params.status)) {
            return `The 'status' parameter must be one of: ${validStatuses.join(', ')}.`;
        }

        return null;
    }

    protected createInvocation(
        params: TestRunUpdateStatusToolParams,
    ): ToolInvocation<TestRunUpdateStatusToolParams, ToolResult> {
        return new TestRunUpdateStatusToolInvocation(params);
    }
}
