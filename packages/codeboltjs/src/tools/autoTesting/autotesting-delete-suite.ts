import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IDeleteSuiteParams, IDeleteSuiteResponse } from '../../types/autoTesting';

export interface AutoTestingDeleteSuiteParams extends IDeleteSuiteParams {}

class AutoTestingDeleteSuiteInvocation extends BaseToolInvocation<AutoTestingDeleteSuiteParams, ToolResult> {
    constructor(params: AutoTestingDeleteSuiteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IDeleteSuiteResponse = await autoTesting.deleteSuite(this.params);
            const payload = response.payload as { ok?: boolean; suiteId?: string };
            if (!payload?.ok && !payload?.suiteId) {
                return {
                    llmContent: `Error: Failed to delete test suite`,
                    returnDisplay: `Error: Failed to delete test suite`,
                    error: { message: 'Failed to delete test suite', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Test suite deleted successfully`,
                returnDisplay: `Deleted test suite with ID: ${this.params.id}`,
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

export class AutoTestingDeleteSuiteTool extends BaseDeclarativeTool<AutoTestingDeleteSuiteParams, ToolResult> {
    constructor() {
        super('autotesting_delete_suite', 'Delete Test Suite', 'Delete a test suite', Kind.Other, {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'ID of the test suite to delete' },
            },
            required: ['id'],
        });
    }

    protected override createInvocation(params: AutoTestingDeleteSuiteParams): ToolInvocation<AutoTestingDeleteSuiteParams, ToolResult> {
        return new AutoTestingDeleteSuiteInvocation(params);
    }
}
