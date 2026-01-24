import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IUpdateSuiteParams, IUpdateSuiteResponse } from '../../types/autoTesting';

export interface AutoTestingUpdateSuiteParams extends IUpdateSuiteParams {}

class AutoTestingUpdateSuiteInvocation extends BaseToolInvocation<AutoTestingUpdateSuiteParams, ToolResult> {
    constructor(params: AutoTestingUpdateSuiteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IUpdateSuiteResponse = await autoTesting.updateSuite(this.params);
            if (!response.payload?.suite) {
                return {
                    llmContent: `Error: Failed to update test suite`,
                    returnDisplay: `Error: Failed to update test suite`,
                    error: { message: 'Failed to update test suite', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const suite = response.payload.suite;
            return {
                llmContent: `Test suite "${suite.name}" updated successfully`,
                returnDisplay: `Updated test suite: ${suite.name} (ID: ${suite.id})`,
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

export class AutoTestingUpdateSuiteTool extends BaseDeclarativeTool<AutoTestingUpdateSuiteParams, ToolResult> {
    constructor() {
        super('autotesting_update_suite', 'Update Test Suite', 'Update an existing test suite', Kind.Other, {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'ID of the test suite' },
                name: { type: 'string', description: 'New name of the test suite' },
                description: { type: 'string', description: 'New description of the test suite' },
                testCaseIds: { type: 'array', items: { type: 'string' }, description: 'New array of test case IDs' },
            },
            required: ['id'],
        });
    }

    protected override createInvocation(params: AutoTestingUpdateSuiteParams): ToolInvocation<AutoTestingUpdateSuiteParams, ToolResult> {
        return new AutoTestingUpdateSuiteInvocation(params);
    }
}
