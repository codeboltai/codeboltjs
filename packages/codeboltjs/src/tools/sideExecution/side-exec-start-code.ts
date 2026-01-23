/**
 * Side Execution Start Code Tool - Starts a side execution with inline JavaScript code
 * Wraps the SDK's codeboltSideExecution.startWithCode() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltSideExecution from '../../modules/sideExecution';

/**
 * Parameters for the SideExecutionStartCode tool
 */
export interface SideExecutionStartCodeParams {
    /**
     * JavaScript code to execute
     */
    inline_code: string;

    /**
     * Additional parameters available in the execution context
     */
    params?: Record<string, any>;

    /**
     * Execution timeout in milliseconds (default: 5 minutes)
     */
    timeout?: number;
}

class SideExecutionStartCodeInvocation extends BaseToolInvocation<
    SideExecutionStartCodeParams,
    ToolResult
> {
    constructor(params: SideExecutionStartCodeParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltSideExecution.startWithCode(
                this.params.inline_code,
                this.params.params,
                this.params.timeout
            );

            if ((response as any).error) {
                const errorMsg = (response as any).error || 'Failed to start side execution';
                return {
                    llmContent: `Failed to start side execution with code: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const executionId = (response as any).sideExecutionId || (response as any).id;
            const codePreview = this.params.inline_code.length > 100
                ? this.params.inline_code.substring(0, 100) + '...'
                : this.params.inline_code;

            return {
                llmContent: `Side execution started successfully with inline code.\nExecution ID: ${executionId}\nCode preview: ${codePreview}`,
                returnDisplay: `Side execution started: ${executionId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error starting side execution with code: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Tool for starting a side execution with inline JavaScript code
 */
export class SideExecutionStartCodeTool extends BaseDeclarativeTool<
    SideExecutionStartCodeParams,
    ToolResult
> {
    static readonly Name: string = 'side_execution_start_code';

    constructor() {
        super(
            SideExecutionStartCodeTool.Name,
            'Start Side Execution (Code)',
            'Start a side execution with inline JavaScript code. This runs code in an isolated child process.',
            Kind.Execute,
            {
                type: 'object',
                properties: {
                    inline_code: {
                        type: 'string',
                        description: 'JavaScript code to execute in the side execution'
                    },
                    params: {
                        type: 'object',
                        description: 'Additional parameters available in the execution context',
                        additionalProperties: true
                    },
                    timeout: {
                        type: 'number',
                        description: 'Execution timeout in milliseconds (default: 5 minutes)'
                    }
                },
                required: ['inline_code']
            }
        );
    }

    protected override validateToolParamValues(
        params: SideExecutionStartCodeParams,
    ): string | null {
        if (!params.inline_code || params.inline_code.trim() === '') {
            return "The 'inline_code' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SideExecutionStartCodeParams,
    ): ToolInvocation<SideExecutionStartCodeParams, ToolResult> {
        return new SideExecutionStartCodeInvocation(params);
    }
}
