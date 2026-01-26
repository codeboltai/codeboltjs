import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { ICreateSuiteParams, ICreateSuiteResponse } from '../../types/autoTesting';

export interface AutoTestingCreateSuiteParams extends ICreateSuiteParams {}

class AutoTestingCreateSuiteInvocation extends BaseToolInvocation<AutoTestingCreateSuiteParams, ToolResult> {
    constructor(params: AutoTestingCreateSuiteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: ICreateSuiteResponse = await autoTesting.createSuite(this.params);
            if (!response.payload?.suite) {
                return {
                    llmContent: `Error: Failed to create test suite`,
                    returnDisplay: `Error: Failed to create test suite`,
                    error: { message: 'Failed to create test suite', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const suite = response.payload.suite;
            return {
                llmContent: `Test suite "${suite.name}" created successfully with ID: ${suite.id}`,
                returnDisplay: `Created test suite: ${suite.name} (ID: ${suite.id})`,
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

export class AutoTestingCreateSuiteTool extends BaseDeclarativeTool<AutoTestingCreateSuiteParams, ToolResult> {
    constructor() {
        super('autotesting_create_suite', 'Create Test Suite', 'Create a new test suite', Kind.Other, {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Name of the test suite' },
                description: { type: 'string', description: 'Description of the test suite' },
                testCaseIds: { type: 'array', items: { type: 'string' }, description: 'Array of test case IDs to include' },
            },
            required: ['name'],
        });
    }

    protected override createInvocation(params: AutoTestingCreateSuiteParams): ToolInvocation<AutoTestingCreateSuiteParams, ToolResult> {
        return new AutoTestingCreateSuiteInvocation(params);
    }
}
