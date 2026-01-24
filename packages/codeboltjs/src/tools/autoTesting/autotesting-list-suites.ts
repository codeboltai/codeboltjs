import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import autoTesting from '../../modules/autoTesting';
import type { IListSuitesParams, IListSuitesResponse } from '../../types/autoTesting';

export interface AutoTestingListSuitesParams extends IListSuitesParams {}

class AutoTestingListSuitesInvocation extends BaseToolInvocation<AutoTestingListSuitesParams, ToolResult> {
    constructor(params: AutoTestingListSuitesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IListSuitesResponse = await autoTesting.listSuites(this.params);
            if (!response.payload?.suites) {
                return {
                    llmContent: `Error: Failed to list test suites`,
                    returnDisplay: `Error: Failed to list test suites`,
                    error: { message: 'Failed to list test suites', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const suites = response.payload.suites;
            return {
                llmContent: `Found ${suites.length} test suite(s)`,
                returnDisplay: JSON.stringify(suites, null, 2),
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

export class AutoTestingListSuitesTool extends BaseDeclarativeTool<AutoTestingListSuitesParams, ToolResult> {
    constructor() {
        super('autotesting_list_suites', 'List Test Suites', 'List all test suites', Kind.Other, {
            type: 'object',
            properties: {},
            required: [],
        });
    }

    protected override createInvocation(params: AutoTestingListSuitesParams): ToolInvocation<AutoTestingListSuitesParams, ToolResult> {
        return new AutoTestingListSuitesInvocation(params);
    }
}
