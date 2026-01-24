/**
 * Test Case Create Tool - Creates a new test case
 * Wraps the SDK's cbautoTesting.createCase() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbautoTesting from '../../modules/autoTesting';

/**
 * Parameters for the TestCaseCreate tool
 */
export interface TestCaseCreateToolParams {
    /**
     * Unique key identifier for the test case
     */
    key: string;

    /**
     * The name of the test case
     */
    name: string;

    /**
     * Optional description of the test case
     */
    description?: string;

    /**
     * Array of test steps
     */
    steps: Array<{ content: string; order?: number }>;

    /**
     * Optional labels for categorization
     */
    labels?: string[];

    /**
     * Optional priority level
     */
    priority?: 'low' | 'medium' | 'high' | 'automated';

    /**
     * Optional test type
     */
    type?: string;
}

class TestCaseCreateToolInvocation extends BaseToolInvocation<
    TestCaseCreateToolParams,
    ToolResult
> {
    constructor(params: TestCaseCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbautoTesting.createCase({
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
                    llmContent: 'Error creating test case: No test case returned in response',
                    returnDisplay: 'Error creating test case: No test case returned',
                    error: {
                        message: 'No test case returned in response',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully created test case:\nID: ${testCase.id}\nKey: ${testCase.key}\nName: ${testCase.name}\nDescription: ${testCase.description || 'N/A'}\nSteps: ${testCase.steps?.length || 0}\nPriority: ${testCase.priority || 'N/A'}\nLabels: ${testCase.labels?.join(', ') || 'None'}`,
                returnDisplay: `Created test case: ${testCase.name} (ID: ${testCase.id})`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating test case: ${errorMessage}`,
                returnDisplay: `Error creating test case: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the TestCaseCreate tool logic
 */
export class TestCaseCreateTool extends BaseDeclarativeTool<
    TestCaseCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'test_case_create';

    constructor() {
        super(
            TestCaseCreateTool.Name,
            'TestCaseCreate',
            'Creates a new test case with the specified key, name, steps, and optional metadata. Test cases define individual tests that can be added to test suites.',
            Kind.Edit,
            {
                properties: {
                    key: {
                        description: 'Unique key identifier for the test case (e.g., "TC-001").',
                        type: 'string',
                    },
                    name: {
                        description: 'The name of the test case.',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of what the test case validates.',
                        type: 'string',
                    },
                    steps: {
                        description: 'Array of test steps, each with content and optional order.',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                content: { type: 'string', description: 'The step instruction or action' },
                                order: { type: 'number', description: 'Optional order of the step' },
                            },
                            required: ['content'],
                        },
                    },
                    labels: {
                        description: 'Optional labels for categorization.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    priority: {
                        description: 'Optional priority level: low, medium, high, or automated.',
                        type: 'string',
                        enum: ['low', 'medium', 'high', 'automated'],
                    },
                    type: {
                        description: 'Optional test type (e.g., "functional", "regression").',
                        type: 'string',
                    },
                },
                required: ['key', 'name', 'steps'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: TestCaseCreateToolParams,
    ): string | null {
        if (!params.key || params.key.trim() === '') {
            return "The 'key' parameter must be non-empty.";
        }

        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }

        if (!params.steps || !Array.isArray(params.steps) || params.steps.length === 0) {
            return "The 'steps' parameter must be a non-empty array.";
        }

        for (let i = 0; i < params.steps.length; i++) {
            if (!params.steps[i].content || params.steps[i].content.trim() === '') {
                return `Step ${i + 1} must have non-empty content.`;
            }
        }

        return null;
    }

    protected createInvocation(
        params: TestCaseCreateToolParams,
    ): ToolInvocation<TestCaseCreateToolParams, ToolResult> {
        return new TestCaseCreateToolInvocation(params);
    }
}
