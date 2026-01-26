import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IListCasesParams, IListCasesResponse } from '../../types/autoTesting';

export interface AutoTestingListCasesParams extends IListCasesParams {}

class AutoTestingListCasesInvocation extends BaseToolInvocation<AutoTestingListCasesParams, ToolResult> {
    constructor(params: AutoTestingListCasesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IListCasesResponse = await autoTesting.listCases(this.params);
            if (!response.payload?.cases) {
                return {
                    llmContent: `Error: Failed to list test cases`,
                    returnDisplay: `Error: Failed to list test cases`,
                    error: { message: 'Failed to list test cases', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const cases = response.payload.cases;
            return {
                llmContent: `Found ${cases.length} test case(s)`,
                returnDisplay: JSON.stringify(cases, null, 2),
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

export class AutoTestingListCasesTool extends BaseDeclarativeTool<AutoTestingListCasesParams, ToolResult> {
    constructor() {
        super('autotesting_list_cases', 'List Test Cases', 'List all test cases', Kind.Other, {
            type: 'object',
            properties: {},
            required: [],
        });
    }

    protected override createInvocation(params: AutoTestingListCasesParams): ToolInvocation<AutoTestingListCasesParams, ToolResult> {
        return new AutoTestingListCasesInvocation(params);
    }
}
