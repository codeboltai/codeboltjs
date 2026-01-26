import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IUpdateCaseParams, IUpdateCaseResponse } from '../../types/autoTesting';

export interface AutoTestingUpdateCaseParams extends IUpdateCaseParams {}

class AutoTestingUpdateCaseInvocation extends BaseToolInvocation<AutoTestingUpdateCaseParams, ToolResult> {
    constructor(params: AutoTestingUpdateCaseParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IUpdateCaseResponse = await autoTesting.updateCase(this.params);
            if (!response.payload?.testCase) {
                return {
                    llmContent: `Error: Failed to update test case`,
                    returnDisplay: `Error: Failed to update test case`,
                    error: { message: 'Failed to update test case', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const testCase = response.payload.testCase;
            return {
                llmContent: `Test case "${testCase.name}" updated successfully`,
                returnDisplay: `Updated test case: ${testCase.name} (ID: ${testCase.id})`,
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

export class AutoTestingUpdateCaseTool extends BaseDeclarativeTool<AutoTestingUpdateCaseParams, ToolResult> {
    constructor() {
        super('autotesting_update_case', 'Update Test Case', 'Update an existing test case', Kind.Other, {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'ID of the test case' },
                key: { type: 'string', description: 'New unique key for the test case' },
                name: { type: 'string', description: 'New name of the test case' },
                description: { type: 'string', description: 'New description of the test case' },
                steps: { 
                    type: 'array', 
                    items: { 
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            content: { type: 'string' },
                            order: { type: 'number' }
                        },
                        required: ['content']
                    }, 
                    description: 'New array of test steps' 
                },
                labels: { type: 'array', items: { type: 'string' }, description: 'New labels for the test case' },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'automated'], description: 'New priority of the test case' },
                type: { type: 'string', description: 'New type of the test case' },
            },
            required: ['id'],
        });
    }

    protected override createInvocation(params: AutoTestingUpdateCaseParams): ToolInvocation<AutoTestingUpdateCaseParams, ToolResult> {
        return new AutoTestingUpdateCaseInvocation(params);
    }
}
