/**
 * Context Rule Evaluate Tool - Evaluates context rules against provided variables
 * Wraps the SDK's contextRuleEngine.evaluate() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import contextRuleEngine from '../../modules/contextRuleEngine';

/**
 * Parameters for the ContextRuleEvaluate tool
 */
export interface ContextRuleEvaluateToolParams {
    /**
     * Scope variables to evaluate rules against
     */
    scope_variables: Record<string, any>;

    /**
     * Additional variables to include in evaluation
     */
    additional_variables?: Record<string, any>;

    /**
     * Optional input string for context
     */
    input?: string;

    /**
     * Optional list of specific rule engine IDs to evaluate
     */
    rule_engine_ids?: string[];
}

class ContextRuleEvaluateToolInvocation extends BaseToolInvocation<
    ContextRuleEvaluateToolParams,
    ToolResult
> {
    constructor(params: ContextRuleEvaluateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await contextRuleEngine.evaluate({
                scope_variables: this.params.scope_variables,
                additional_variables: this.params.additional_variables,
                input: this.params.input,
                rule_engine_ids: this.params.rule_engine_ids,
            });

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error evaluating context rules: ${errorMsg}`,
                    returnDisplay: `Error evaluating context rules: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const data = response.data;
            if (!data) {
                return {
                    llmContent: 'Context rules evaluated successfully (no data returned).',
                    returnDisplay: 'Context rules evaluated successfully.',
                };
            }

            const llmContent = `Context rules evaluation results:
- Matched rules: ${data.matched_rules?.length || 0}${data.matched_rules?.length ? '\n  ' + data.matched_rules.join(', ') : ''}
- Included memories: ${data.included_memories?.length || 0}${data.included_memories?.length ? '\n  ' + data.included_memories.join(', ') : ''}
- Excluded memories: ${data.excluded_memories?.length || 0}${data.excluded_memories?.length ? '\n  ' + data.excluded_memories.join(', ') : ''}
- Forced memories: ${data.forced_memories?.length || 0}${data.forced_memories?.length ? '\n  ' + data.forced_memories.join(', ') : ''}`;

            return {
                llmContent,
                returnDisplay: `Evaluated context rules: ${data.matched_rules?.length || 0} rules matched`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error evaluating context rules: ${errorMessage}`,
                returnDisplay: `Error evaluating context rules: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ContextRuleEvaluate tool logic
 */
export class ContextRuleEvaluateTool extends BaseDeclarativeTool<
    ContextRuleEvaluateToolParams,
    ToolResult
> {
    static readonly Name: string = 'context_rule_evaluate';

    constructor() {
        super(
            ContextRuleEvaluateTool.Name,
            'ContextRuleEvaluate',
            `Evaluates context rules against provided variables. Returns which rules matched and which memories should be included, excluded, or forced based on the evaluation.`,
            Kind.Execute,
            {
                properties: {
                    scope_variables: {
                        description: 'Scope variables to evaluate rules against (key-value pairs)',
                        type: 'object',
                        additionalProperties: true,
                    },
                    additional_variables: {
                        description: 'Optional additional variables to include in evaluation',
                        type: 'object',
                        additionalProperties: true,
                    },
                    input: {
                        description: 'Optional input string for context',
                        type: 'string',
                    },
                    rule_engine_ids: {
                        description: 'Optional list of specific rule engine IDs to evaluate. If not provided, all enabled rule engines are evaluated.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['scope_variables'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ContextRuleEvaluateToolParams,
    ): string | null {
        if (!params.scope_variables || typeof params.scope_variables !== 'object') {
            return "The 'scope_variables' parameter must be an object.";
        }

        if (params.additional_variables !== undefined && typeof params.additional_variables !== 'object') {
            return "The 'additional_variables' parameter must be an object if provided.";
        }

        if (params.rule_engine_ids !== undefined) {
            if (!Array.isArray(params.rule_engine_ids)) {
                return "The 'rule_engine_ids' parameter must be an array if provided.";
            }
            for (const id of params.rule_engine_ids) {
                if (typeof id !== 'string' || id.trim() === '') {
                    return "Each rule engine ID must be a non-empty string.";
                }
            }
        }

        return null;
    }

    protected createInvocation(
        params: ContextRuleEvaluateToolParams,
    ): ToolInvocation<ContextRuleEvaluateToolParams, ToolResult> {
        return new ContextRuleEvaluateToolInvocation(params);
    }
}
