import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IUpdateRunCaseParams, IUpdateRunCaseResponse } from '../../types/autoTesting';

export interface AutoTestingUpdateRunCaseParams extends IUpdateRunCaseParams {}

class AutoTestingUpdateRunCaseInvocation extends BaseToolInvocation<AutoTestingUpdateRunCaseParams, ToolResult> {
    constructor(params: AutoTestingUpdateRunCaseParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IUpdateRunCaseResponse = await autoTesting.updateRunCaseStatus(this.params);
            if (!response.payload?.run) {
                return {
                    llmContent: `Error: Failed to update test run case status`,
                    returnDisplay: `Error: Failed to update test run case status`,
                    error: { message: 'Failed to update test run case status', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Test run case status updated to "${this.params.status}"`,
                returnDisplay: `Updated case ${this.params.caseId} in run ${this.params.runId} to ${this.params.status}`,
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

export class AutoTestingUpdateRunCaseTool extends BaseDeclarativeTool<AutoTestingUpdateRunCaseParams, ToolResult> {
    constructor() {
        super('autotesting_update_run_case', 'Update Run Case Status', 'Update the status of a test case in a run', Kind.Other, {
            type: 'object',
            properties: {
                runId: { type: 'string', description: 'ID of the test run' },
                caseId: { type: 'string', description: 'ID of the test case' },
                status: { type: 'string', enum: ['pending', 'running', 'passed', 'failed', 'skipped'], description: 'New status of the test case' },
                userOverride: { type: 'boolean', description: 'Whether this is a user override' },
            },
            required: ['runId', 'caseId', 'status'],
        });
    }

    protected override createInvocation(params: AutoTestingUpdateRunCaseParams): ToolInvocation<AutoTestingUpdateRunCaseParams, ToolResult> {
        return new AutoTestingUpdateRunCaseInvocation(params);
    }
}
