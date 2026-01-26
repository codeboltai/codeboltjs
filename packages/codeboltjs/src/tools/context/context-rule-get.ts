/**
 * Context Rule Get Tool - Gets a context rule engine by ID
 * Wraps the SDK's contextRuleEngine.get() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import contextRuleEngine from '../../modules/contextRuleEngine';

/**
 * Parameters for the ContextRuleGet tool
 */
export interface ContextRuleGetToolParams {
    /**
     * The ID of the context rule engine to retrieve
     */
    id: string;
}

class ContextRuleGetToolInvocation extends BaseToolInvocation<
    ContextRuleGetToolParams,
    ToolResult
> {
    constructor(params: ContextRuleGetToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await contextRuleEngine.get(this.params.id);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error getting context rule: ${errorMsg}`,
                    returnDisplay: `Error getting context rule: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const ruleEngine = response.data?.ruleEngine;
            if (!ruleEngine) {
                return {
                    llmContent: `Context rule engine with ID '${this.params.id}' not found.`,
                    returnDisplay: `Context rule engine not found: ${this.params.id}`,
                    error: {
                        message: `Context rule engine not found: ${this.params.id}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const rulesDetails = ruleEngine.rules?.map((rule, index) => {
                const conditionsStr = rule.conditions?.map(c =>
                    `${c.variable} ${c.operator} ${JSON.stringify(c.value)}`
                ).join(rule.condition_logic === 'or' ? ' OR ' : ' AND ') || 'No conditions';

                return `  Rule ${index + 1}: ${rule.name}
    Description: ${rule.description || 'N/A'}
    Conditions: ${conditionsStr}
    Action: ${rule.action}
    Enabled: ${rule.enabled !== false}`;
            }).join('\n') || '  No rules defined';

            const llmContent = `Context Rule Engine Details:
ID: ${ruleEngine.id}
Name: ${ruleEngine.name}
Description: ${ruleEngine.description || 'N/A'}
Enabled: ${ruleEngine.enabled}
Created: ${ruleEngine.createdAt}
Updated: ${ruleEngine.updatedAt}

Rules (${ruleEngine.rules?.length || 0}):
${rulesDetails}`;

            return {
                llmContent,
                returnDisplay: `Retrieved context rule engine: ${ruleEngine.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting context rule: ${errorMessage}`,
                returnDisplay: `Error getting context rule: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ContextRuleGet tool logic
 */
export class ContextRuleGetTool extends BaseDeclarativeTool<
    ContextRuleGetToolParams,
    ToolResult
> {
    static readonly Name: string = 'context_rule_get';

    constructor() {
        super(
            ContextRuleGetTool.Name,
            'ContextRuleGet',
            `Gets a context rule engine by its ID. Returns detailed information about the rule engine including all its rules, conditions, and configuration.`,
            Kind.Read,
            {
                properties: {
                    id: {
                        description: 'The unique identifier of the context rule engine to retrieve',
                        type: 'string',
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ContextRuleGetToolParams,
    ): string | null {
        if (!params.id || params.id.trim() === '') {
            return "The 'id' parameter must be a non-empty string.";
        }

        return null;
    }

    protected createInvocation(
        params: ContextRuleGetToolParams,
    ): ToolInvocation<ContextRuleGetToolParams, ToolResult> {
        return new ContextRuleGetToolInvocation(params);
    }
}
