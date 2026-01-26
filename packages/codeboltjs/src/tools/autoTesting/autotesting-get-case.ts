import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IGetCaseParams, IGetCaseResponse } from '../../types/autoTesting';

export interface AutoTestingGetCaseParams extends IGetCaseParams {}

class AutoTestingGetCaseInvocation extends BaseToolInvocation<AutoTestingGetCaseParams, ToolResult> {
    constructor(params: AutoTestingGetCaseParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IGetCaseResponse = await autoTesting.getCase(this.params);
            if (!response.payload?.testCase) {
                return {
                    llmContent: `Error: Test case not found`,
                    returnDisplay: `Error: Test case not found`,
                    error: { message: 'Test case not found', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const testCase = response.payload.testCase;
            return {
                llmContent: `Test case "${testCase.name}" retrieved successfully`,
                returnDisplay: JSON.stringify(testCase, null, 2),
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

export class AutoTestingGetCaseTool extends BaseDeclarativeTool<AutoTestingGetCaseParams, ToolResult> {
    constructor() {
        super('autotesting_get_case', 'Get Test Case', 'Get a test case by ID', Kind.Other, {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'ID of the test case' },
            },
            required: ['id'],
        });
    }

    protected override createInvocation(params: AutoTestingGetCaseParams): ToolInvocation<AutoTestingGetCaseParams, ToolResult> {
        return new AutoTestingGetCaseInvocation(params);
    }
}
