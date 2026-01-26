import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IAddCaseToSuiteParams, IAddCaseToSuiteResponse } from '../../types/autoTesting';

export interface AutoTestingAddCaseToSuiteParams extends IAddCaseToSuiteParams {}

class AutoTestingAddCaseToSuiteInvocation extends BaseToolInvocation<AutoTestingAddCaseToSuiteParams, ToolResult> {
    constructor(params: AutoTestingAddCaseToSuiteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IAddCaseToSuiteResponse = await autoTesting.addCaseToSuite(this.params);
            if (!response.payload?.suite) {
                return {
                    llmContent: `Error: Failed to add test case to suite`,
                    returnDisplay: `Error: Failed to add test case to suite`,
                    error: { message: 'Failed to add test case to suite', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const suite = response.payload.suite;
            return {
                llmContent: `Test case added to suite "${suite.name}" successfully`,
                returnDisplay: `Added case ${this.params.caseId} to suite ${suite.name}`,
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

export class AutoTestingAddCaseToSuiteTool extends BaseDeclarativeTool<AutoTestingAddCaseToSuiteParams, ToolResult> {
    constructor() {
        super('autotesting_add_case_to_suite', 'Add Case to Suite', 'Add a test case to a test suite', Kind.Other, {
            type: 'object',
            properties: {
                suiteId: { type: 'string', description: 'ID of the test suite' },
                caseId: { type: 'string', description: 'ID of the test case to add' },
            },
            required: ['suiteId', 'caseId'],
        });
    }

    protected override createInvocation(params: AutoTestingAddCaseToSuiteParams): ToolInvocation<AutoTestingAddCaseToSuiteParams, ToolResult> {
        return new AutoTestingAddCaseToSuiteInvocation(params);
    }
}
