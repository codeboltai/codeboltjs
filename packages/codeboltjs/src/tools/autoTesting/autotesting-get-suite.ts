import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IGetSuiteParams, IGetSuiteResponse } from '../../types/autoTesting';

export interface AutoTestingGetSuiteParams extends IGetSuiteParams {}

class AutoTestingGetSuiteInvocation extends BaseToolInvocation<AutoTestingGetSuiteParams, ToolResult> {
    constructor(params: AutoTestingGetSuiteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IGetSuiteResponse = await autoTesting.getSuite(this.params);
            if (!response.payload?.suite) {
                return {
                    llmContent: `Error: Test suite not found`,
                    returnDisplay: `Error: Test suite not found`,
                    error: { message: 'Test suite not found', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const suite = response.payload.suite;
            const testCases = response.payload.testCases || [];
            return {
                llmContent: `Test suite "${suite.name}" retrieved with ${testCases.length} test cases`,
                returnDisplay: JSON.stringify({ suite, testCases }, null, 2),
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

export class AutoTestingGetSuiteTool extends BaseDeclarativeTool<AutoTestingGetSuiteParams, ToolResult> {
    constructor() {
        super('autotesting_get_suite', 'Get Test Suite', 'Get a test suite by ID', Kind.Other, {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'ID of the test suite' },
            },
            required: ['id'],
        });
    }

    protected override createInvocation(params: AutoTestingGetSuiteParams): ToolInvocation<AutoTestingGetSuiteParams, ToolResult> {
        return new AutoTestingGetSuiteInvocation(params);
    }
}
