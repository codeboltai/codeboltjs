import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IDeleteCaseParams, IDeleteCaseResponse } from '../../types/autoTesting';

export interface AutoTestingDeleteCaseParams extends IDeleteCaseParams {}

class AutoTestingDeleteCaseInvocation extends BaseToolInvocation<AutoTestingDeleteCaseParams, ToolResult> {
    constructor(params: AutoTestingDeleteCaseParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IDeleteCaseResponse = await autoTesting.deleteCase(this.params);
            if (!response.payload?.ok && !response.payload?.caseId) {
                return {
                    llmContent: `Error: Failed to delete test case`,
                    returnDisplay: `Error: Failed to delete test case`,
                    error: { message: 'Failed to delete test case', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Test case deleted successfully`,
                returnDisplay: `Deleted test case with ID: ${this.params.id}`,
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

export class AutoTestingDeleteCaseTool extends BaseDeclarativeTool<AutoTestingDeleteCaseParams, ToolResult> {
    constructor() {
        super('autotesting_delete_case', 'Delete Test Case', 'Delete a test case', Kind.Other, {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'ID of the test case to delete' },
            },
            required: ['id'],
        });
    }

    protected override createInvocation(params: AutoTestingDeleteCaseParams): ToolInvocation<AutoTestingDeleteCaseParams, ToolResult> {
        return new AutoTestingDeleteCaseInvocation(params);
    }
}
