/**
 * Test Case Update Tool - Updates an existing test case
 * Wraps the SDK's cbautoTesting.updateCase() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestCaseUpdate tool
 */
export interface TestCaseUpdateToolParams {
    /**
     * The ID of the test case to update
     */
    case_id: string;

    /**
     * Optional new key for the test case
     */
    key?: string;

    /**
     * Optional new name for the test case
     */
    name?: string;

    /**
     * Optional new description for the test case
     */
    description?: string;

    /**
     * Optional new array of steps
     */
    steps?: Array<{ id?: string; content: string; order?: number }>;

    /**
     * Optional new labels
     */
    labels?: string[];

    /**
     * Optional new priority level
     */
    priority?: 'low' | 'medium' | 'high' | 'automated';

    /**
     * Optional new test type
     */
    type?: string;
}

class TestCaseUpdateToolInvocation extends BaseToolInvocation<
    TestCaseUpdateToolParams,
    ToolResult
> {
    constructor(params: TestCaseUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.updateCase({
                id: this.params.case_id,
                key: this.params.key,
                name: this.params.name,
                description: this.params.description,
                steps: this.params.steps,
                labels: this.params.labels,
                priority: this.params.priority,
                type: this.params.type,
            });

            const testCase = response.payload?.testCase;
            if (!testCase) {
                return {
                    llmContent: `Error updating test case: Case with ID '${this.params.case_id}' not found or update failed`,
                    returnDisplay: `Error updating test case: ${this.params.case_id}`,
                    error: {
                        message: `Case with ID '${this.params.case_id}' not found or update failed`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated test case:\nID: ${testCase.id}\nKey: ${testCase.key}\nName: ${testCase.name}\nDescription: ${testCase.description || 'N/A'}\nSteps: ${testCase.steps?.length || 0}\nPriority: ${testCase.priority || 'N/A'}\nLabels: ${testCase.labels?.join(', ') || 'None'}`,
                returnDisplay: `Updated test case: ${testCase.name} (ID: ${testCase.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating test case: ${errorMessage}`,
                returnDisplay: `Error updating test case: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestCaseUpdate tool logic
 */
export class TestCaseUpdateTool extends BaseDeclarativeTool<
    TestCaseUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_case_update';

    constructor() {
        super(
            TestCaseUpdateTool.Name,
            'TestCaseUpdate',
            'Updates an existing test case with new key, name, description, steps, labels, priority, or type.',
            Kind.Edit,
            {
                properties: {
                    case_id: {
                        description: 'The ID of the test case to update.',
                        type: 'string',
                    },
                    key: {
                        description: 'Optional new key for the test case.',
                        type: 'string',
                    },
                    name: {
                        description: 'Optional new name for the test case.',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional new description for the test case.',
                        type: 'string',
                    },
                    steps: {
                        description: 'Optional new array of steps.',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'Optional step ID for updating existing steps' },
                                content: { type: 'string', description: 'The step instruction or action' },
                                order: { type: 'number', description: 'Optional order of the step' },
                            },
                            required: ['content'],
                        },
                    },
                    labels: {
                        description: 'Optional new labels for categorization.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    priority: {
                        description: 'Optional new priority level: low, medium, high, or automated.',
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'automated'],
                    },
                    type: {
                        description: 'Optional new test type.',
                        type: 'string',
                    },
                },
                required: ['case_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestCaseUpdateToolParams,
    ): string | null {
        if (!params.case_id || params.case_id.trim() === '') {
            return "The 'case_id' parameter must be non-empty.";
        }

        // Ensure at least one update field is provided
        if (!params.key && !params.name && !params.description && !params.steps &&
            !params.labels && !params.priority && !params.type) {
            return 'At least one update field must be provided.';
        }

        // Validate steps if provided
        if (params.steps) {
            for (let i = 0; i < params.steps.length; i++) {
                if (!params.steps[i].content || params.steps[i].content.trim() === '') {
                    return `Step ${i + 1} must have non-empty content.`;
                }
            }
        }

        return null;
    }

    protected createInvocation(
        params: TestCaseUpdateToolParams,
    ): ToolInvocation<TestCaseUpdateToolParams, ToolResult> {
        return new TestCaseUpdateToolInvocation(params);
    }
}
