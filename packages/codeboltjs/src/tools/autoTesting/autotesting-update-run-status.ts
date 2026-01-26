import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IUpdateRunStatusParams, IUpdateRunStatusResponse } from '../../types/autoTesting';

export interface AutoTestingUpdateRunStatusParams extends IUpdateRunStatusParams {}

class AutoTestingUpdateRunStatusInvocation extends BaseToolInvocation<AutoTestingUpdateRunStatusParams, ToolResult> {
    constructor(params: AutoTestingUpdateRunStatusParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IUpdateRunStatusResponse = await autoTesting.updateRunStatus(this.params);
            if (!response.payload?.run) {
                return {
                    llmContent: `Error: Failed to update test run status`,
                    returnDisplay: `Error: Failed to update test run status`,
                    error: { message: 'Failed to update test run status', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const run = response.payload.run;
            return {
                llmContent: `Test run status updated to "${run.status}"`,
                returnDisplay: `Updated run ${run.id} status to ${run.status}`,
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

export class AutoTestingUpdateRunStatusTool extends BaseDeclarativeTool<AutoTestingUpdateRunStatusParams, ToolResult> {
    constructor() {
        super('autotesting_update_run_status', 'Update Run Status', 'Update the status of a test run', Kind.Other, {
            type: 'object',
            properties: {
                runId: { type: 'string', description: 'ID of the test run' },
                status: { type: 'string', enum: ['pending', 'running', 'completed', 'cancelled'], description: 'New status of the test run' },
            },
            required: ['runId', 'status'],
        });
    }

    protected override createInvocation(params: AutoTestingUpdateRunStatusParams): ToolInvocation<AutoTestingUpdateRunStatusParams, ToolResult> {
        return new AutoTestingUpdateRunStatusInvocation(params);
    }
}
