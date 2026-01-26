import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IGetRunParams, IGetRunResponse } from '../../types/autoTesting';

export interface AutoTestingGetRunParams extends IGetRunParams {}

class AutoTestingGetRunInvocation extends BaseToolInvocation<AutoTestingGetRunParams, ToolResult> {
    constructor(params: AutoTestingGetRunParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IGetRunResponse = await autoTesting.getRun(this.params);
            if (!response.payload?.run) {
                return {
                    llmContent: `Error: Test run not found`,
                    returnDisplay: `Error: Test run not found`,
                    error: { message: 'Test run not found', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const run = response.payload.run;
            return {
                llmContent: `Test run "${run.name}" retrieved successfully`,
                returnDisplay: JSON.stringify(run, null, 2),
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

export class AutoTestingGetRunTool extends BaseDeclarativeTool<AutoTestingGetRunParams, ToolResult> {
    constructor() {
        super('autotesting_get_run', 'Get Test Run', 'Get a test run by ID', Kind.Other, {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'ID of the test run' },
            },
            required: ['id'],
        });
    }

    protected override createInvocation(params: AutoTestingGetRunParams): ToolInvocation<AutoTestingGetRunParams, ToolResult> {
        return new AutoTestingGetRunInvocation(params);
    }
}
