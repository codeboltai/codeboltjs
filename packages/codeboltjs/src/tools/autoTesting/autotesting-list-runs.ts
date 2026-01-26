import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IListRunsParams, IListRunsResponse } from '../../types/autoTesting';

export interface AutoTestingListRunsParams extends IListRunsParams {}

class AutoTestingListRunsInvocation extends BaseToolInvocation<AutoTestingListRunsParams, ToolResult> {
    constructor(params: AutoTestingListRunsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IListRunsResponse = await autoTesting.listRuns(this.params);
            if (!response.payload?.runs) {
                return {
                    llmContent: `Error: Failed to list test runs`,
                    returnDisplay: `Error: Failed to list test runs`,
                    error: { message: 'Failed to list test runs', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const runs = response.payload.runs;
            return {
                llmContent: `Found ${runs.length} test run(s)`,
                returnDisplay: JSON.stringify(runs, null, 2),
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class AutoTestingListRunsTool extends BaseDeclarativeTool<AutoTestingListRunsParams, ToolResult> {
    constructor() {
        super('autotesting_list_runs', 'List Test Runs', 'List all test runs', Kind.Other, {
            type: 'object',
            properties: {
                suiteId: { type: 'string', description: 'Filter by test suite ID' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: AutoTestingListRunsParams): ToolInvocation<AutoTestingListRunsParams, ToolResult> {
        return new AutoTestingListRunsInvocation(params);
    }
}
