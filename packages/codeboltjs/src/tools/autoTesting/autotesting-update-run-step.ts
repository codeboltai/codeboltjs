import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IUpdateRunStepParams, IUpdateRunStepResponse } from '../../types/autoTesting';

export interface AutoTestingUpdateRunStepParams extends IUpdateRunStepParams {}

class AutoTestingUpdateRunStepInvocation extends BaseToolInvocation<AutoTestingUpdateRunStepParams, ToolResult> {
    constructor(params: AutoTestingUpdateRunStepParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IUpdateRunStepResponse = await autoTesting.updateRunStepStatus(this.params);
            if (!response.payload?.run) {
                return {
                    llmContent: `Error: Failed to update test run step status`,
                    returnDisplay: `Error: Failed to update test run step status`,
                    error: { message: 'Failed to update test run step status', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Test run step status updated to "${this.params.status}"`,
                returnDisplay: `Updated step ${this.params.stepId} in case ${this.params.caseId} to ${this.params.status}`,
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

export class AutoTestingUpdateRunStepTool extends BaseDeclarativeTool<AutoTestingUpdateRunStepParams, ToolResult> {
    constructor() {
        super('autotesting_update_run_step', 'Update Run Step Status', 'Update the status of a test step in a run', Kind.Other, {
            type: 'object',
            properties: {
                runId: { type: 'string', description: 'ID of the test run' },
                caseId: { type: 'string', description: 'ID of the test case' },
                stepId: { type: 'string', description: 'ID of the test step' },
                status: { type: 'string', enum: ['pending', 'running', 'passed', 'failed', 'skipped'], description: 'New status of the test step' },
                logs: { type: 'string', description: 'Logs for the test step' },
                userOverride: { type: 'boolean', description: 'Whether this is a user override' },
            },
            required: ['runId', 'caseId', 'stepId', 'status'],
        });
    }

    protected override createInvocation(params: AutoTestingUpdateRunStepParams): ToolInvocation<AutoTestingUpdateRunStepParams, ToolResult> {
        return new AutoTestingUpdateRunStepInvocation(params);
    }
}
