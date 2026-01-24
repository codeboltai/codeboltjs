import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { ICreateCaseParams, ICreateCaseResponse } from '../../types/autoTesting';

export interface AutoTestingCreateCaseParams extends ICreateCaseParams {}

class AutoTestingCreateCaseInvocation extends BaseToolInvocation<AutoTestingCreateCaseParams, ToolResult> {
    constructor(params: AutoTestingCreateCaseParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: ICreateCaseResponse = await autoTesting.createCase(this.params);
            if (!response.payload?.testCase) {
                return {
                    llmContent: `Error: Failed to create test case`,
                    returnDisplay: `Error: Failed to create test case`,
                    error: { message: 'Failed to create test case', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const testCase = response.payload.testCase;
            return {
                llmContent: `Test case "${testCase.name}" created successfully with ID: ${testCase.id}`,
                returnDisplay: `Created test case: ${testCase.name} (ID: ${testCase.id})`,
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

export class AutoTestingCreateCaseTool extends BaseDeclarativeTool<AutoTestingCreateCaseParams, ToolResult> {
    constructor() {
        super('autotesting_create_case', 'Create Test Case', 'Create a new test case', Kind.Other, {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Unique key for the test case' },
                name: { type: 'string', description: 'Name of the test case' },
                description: { type: 'string', description: 'Description of the test case' },
                steps: { 
                    type: 'array', 
                    items: { 
                        type: 'object',
                        properties: {
                            content: { type: 'string' },
                            order: { type: 'number' }
                        },
                        required: ['content']
                    }, 
                    description: 'Array of test steps' 
                },
                labels: { type: 'array', items: { type: 'string' }, description: 'Labels for the test case' },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'automated'], description: 'Priority of the test case' },
                type: { type: 'string', description: 'Type of the test case' },
            },
            required: ['key', 'name', 'steps'],
        });
    }

    protected override createInvocation(params: AutoTestingCreateCaseParams): ToolInvocation<AutoTestingCreateCaseParams, ToolResult> {
        return new AutoTestingCreateCaseInvocation(params);
    }
}
