import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IRemoveCaseFromSuiteParams, IRemoveCaseFromSuiteResponse } from '../../types/autoTesting';

export interface AutoTestingRemoveCaseFromSuiteParams extends IRemoveCaseFromSuiteParams {}

class AutoTestingRemoveCaseFromSuiteInvocation extends BaseToolInvocation<AutoTestingRemoveCaseFromSuiteParams, ToolResult> {
    constructor(params: AutoTestingRemoveCaseFromSuiteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IRemoveCaseFromSuiteResponse = await autoTesting.removeCaseFromSuite(this.params);
            if (!response.payload?.suite) {
                return {
                    llmContent: `Error: Failed to remove test case from suite`,
                    returnDisplay: `Error: Failed to remove test case from suite`,
                    error: { message: 'Failed to remove test case from suite', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const suite = response.payload.suite;
            return {
                llmContent: `Test case removed from suite "${suite.name}" successfully`,
                returnDisplay: `Removed case ${this.params.caseId} from suite ${suite.name}`,
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

export class AutoTestingRemoveCaseFromSuiteTool extends BaseDeclarativeTool<AutoTestingRemoveCaseFromSuiteParams, ToolResult> {
    constructor() {
        super('autotesting_remove_case_from_suite', 'Remove Case from Suite', 'Remove a test case from a test suite', Kind.Other, {
            type: 'object',
            properties: {
                suiteId: { type: 'string', description: 'ID of the test suite' },
                caseId: { type: 'string', description: 'ID of the test case to remove' },
            },
            required: ['suiteId', 'caseId'],
        });
    }

    protected override createInvocation(params: AutoTestingRemoveCaseFromSuiteParams): ToolInvocation<AutoTestingRemoveCaseFromSuiteParams, ToolResult> {
        return new AutoTestingRemoveCaseFromSuiteInvocation(params);
    }
}
