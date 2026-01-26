/**
 * Test Case Get Tool - Retrieves a test case by ID
 * Wraps the SDK's cbautoTesting.getCase() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestCaseGet tool
 */
export interface TestCaseGetToolParams {
    /**
     * The ID of the test case to retrieve
     */
    case_id: string;
}

class TestCaseGetToolInvocation extends BaseToolInvocation<
    TestCaseGetToolParams,
    ToolResult
> {
    constructor(params: TestCaseGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.getCase({
                id: this.params.case_id,
            });

            const testCase = response.payload?.testCase;

            if (!testCase) {
                return {
                    llmContent: `Error: Test case with ID '${this.params.case_id}' not found`,
                    returnDisplay: `Test case not found: ${this.params.case_id}`,
                    error: {
                        message: `Test case with ID '${this.params.case_id}' not found`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const stepsInfo = testCase.steps?.map((step, idx) =>
                `  ${idx + 1}. ${step.content}${step.status ? ` [${step.status}]` : ''}`
            ).join('\n') || '  No steps defined';

            const llmContent = `Test Case Details:
ID: ${testCase.id}
Key: ${testCase.key}
Name: ${testCase.name}
Description: ${testCase.description || 'N/A'}
Priority: ${testCase.priority || 'N/A'}
Type: ${testCase.type || 'N/A'}
Labels: ${testCase.labels?.join(', ') || 'None'}
Created: ${testCase.createdAt}
Updated: ${testCase.updatedAt}
Steps (${testCase.steps?.length || 0}):
${stepsInfo}`;

            return {
                llmContent,
                returnDisplay: `Retrieved test case: ${testCase.name} (${testCase.steps?.length || 0} steps)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving test case: ${errorMessage}`,
                returnDisplay: `Error retrieving test case: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestCaseGet tool logic
 */
export class TestCaseGetTool extends BaseDeclarativeTool<
    TestCaseGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_case_get';

    constructor() {
        super(
            TestCaseGetTool.Name,
            'TestCaseGet',
            'Retrieves a test case by its ID, including all steps and metadata.',
            Kind.Read,
            {
                properties: {
                    case_id: {
                        description: 'The ID of the test case to retrieve.',
                        type: 'string',
                    },
                },
                required: ['case_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestCaseGetToolParams,
    ): string | null {
        if (!params.case_id || params.case_id.trim() === '') {
            return "The 'case_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: TestCaseGetToolParams,
    ): ToolInvocation<TestCaseGetToolParams, ToolResult> {
        return new TestCaseGetToolInvocation(params);
    }
}
