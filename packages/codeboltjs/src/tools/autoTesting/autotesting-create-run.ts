import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { ICreateRunParams, ICreateRunResponse } from '../../types/autoTesting';

export interface AutoTestingCreateRunParams extends ICreateRunParams {}

class AutoTestingCreateRunInvocation extends BaseToolInvocation<AutoTestingCreateRunParams, ToolResult> {
    constructor(params: AutoTestingCreateRunParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: ICreateRunResponse = await autoTesting.createRun(this.params);
            if (!response.payload?.run) {
                return {
                    llmContent: `Error: Failed to create test run`,
                    returnDisplay: `Error: Failed to create test run`,
                    error: { message: 'Failed to create test run', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const run = response.payload.run;
            return {
                llmContent: `Test run "${run.name}" created successfully with ID: ${run.id}`,
                returnDisplay: `Created test run: ${run.name} (ID: ${run.id})`,
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

export class AutoTestingCreateRunTool extends BaseDeclarativeTool<AutoTestingCreateRunParams, ToolResult> {
    constructor() {
        super('autotesting_create_run', 'Create Test Run', 'Create a new test run', Kind.Other, {
            type: 'object',
            properties: {
                testSuiteId: { type: 'string', description: 'ID of the test suite to run' },
                name: { type: 'string', description: 'Name of the test run' },
            },
            required: ['testSuiteId'],
        });
    }

    protected override createInvocation(params: AutoTestingCreateRunParams): ToolInvocation<AutoTestingCreateRunParams, ToolResult> {
        return new AutoTestingCreateRunInvocation(params);
    }
}
