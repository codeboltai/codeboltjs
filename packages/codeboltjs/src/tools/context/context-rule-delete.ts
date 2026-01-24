/**
 * Context Rule Delete Tool - Deletes a context rule engine by ID
 * Wraps the SDK's contextRuleEngine.delete() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import contextRuleEngine from '../../modules/contextRuleEngine';

/**
 * Parameters for the ContextRuleDelete tool
 */
export interface ContextRuleDeleteToolParams {
    /**
     * The ID of the context rule engine to delete
     */
    id: string;
}

class ContextRuleDeleteToolInvocation extends BaseToolInvocation<
    ContextRuleDeleteToolParams,
    ToolResult
> {
    constructor(params: ContextRuleDeleteToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await contextRuleEngine.delete(this.params.id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error deleting context rule: ${errorMsg}`,
                    returnDisplay: `Error deleting context rule: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const deleted = response.data?.deleted;
            if (deleted === false) {
                return {
                    llmContent: `Context rule engine with ID '${this.params.id}' could not be deleted or was not found.`,
                    returnDisplay: `Context rule engine could not be deleted: ${this.params.id}`,
                    error: {
                        message: `Context rule engine could not be deleted: ${this.params.id}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted context rule engine with ID: ${this.params.id}`,
                returnDisplay: `Successfully deleted context rule engine: ${this.params.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting context rule: ${errorMessage}`,
                returnDisplay: `Error deleting context rule: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ContextRuleDelete tool logic
 */
export class ContextRuleDeleteTool extends BaseDeclarativeTool<
    ContextRuleDeleteToolParams,
    ToolResult
> {
    static readonly Name: string = 'context_rule_delete';

    constructor() {
        super(
            ContextRuleDeleteTool.Name,
            'ContextRuleDelete',
            `Deletes a context rule engine by its ID. This action is permanent and cannot be undone.`,
            Kind.Delete,
            {
                properties: {
                    id: {
                        description: 'The unique identifier of the context rule engine to delete',
                        type: 'string',
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ContextRuleDeleteToolParams,
    ): string | null {
        if (!params.id || params.id.trim() === '') {
            return "The 'id' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: ContextRuleDeleteToolParams,
    ): ToolInvocation<ContextRuleDeleteToolParams, ToolResult> {
        return new ContextRuleDeleteToolInvocation(params);
    }
}
