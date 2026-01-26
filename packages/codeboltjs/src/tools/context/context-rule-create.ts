/**
 * Context Rule Create Tool - Creates a new context rule engine
 * Wraps the SDK's contextRuleEngine.create() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import contextRuleEngine from '../../modules/contextRuleEngine';
import type { Rule } from '../../types/contextRuleEngine';

/**
 * Parameters for the ContextRuleCreate tool
 */
export interface ContextRuleCreateToolParams {
    /**
     * The name of the context rule engine
     */
    name: string;

    /**
     * Optional description of the context rule engine
     */
    description?: string;

    /**
     * The rules to include in the context rule engine
     */
    rules: Rule[];

    /**
     * Whether the rule engine is enabled (defaults to true)
     */
    enabled?: boolean;
}

class ContextRuleCreateToolInvocation extends BaseToolInvocation<
    ContextRuleCreateToolParams,
    ToolResult
> {
    constructor(params: ContextRuleCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await contextRuleEngine.create({
                name: this.params.name,
                description: this.params.description,
                rules: this.params.rules,
                enabled: this.params.enabled,
            });

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error creating context rule: ${errorMsg}`,
                    returnDisplay: `Error creating context rule: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const ruleEngine = response.data?.ruleEngine;
            const llmContent = ruleEngine
                ? `Successfully created context rule engine:\nID: ${ruleEngine.id}\nName: ${ruleEngine.name}\nDescription: ${ruleEngine.description || 'N/A'}\nEnabled: ${ruleEngine.enabled}\nRules count: ${ruleEngine.rules?.length || 0}`
                : 'Context rule engine created successfully';

            return {
                llmContent,
                returnDisplay: `Successfully created context rule engine: ${this.params.name}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating context rule: ${errorMessage}`,
                returnDisplay: `Error creating context rule: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ContextRuleCreate tool logic
 */
export class ContextRuleCreateTool extends BaseDeclarativeTool<
    ContextRuleCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'context_rule_create';

    constructor() {
        super(
            ContextRuleCreateTool.Name,
            'ContextRuleCreate',
            `Creates a new context rule engine for conditional memory inclusion. A rule engine contains rules that determine when certain memories should be included, excluded, or prioritized based on context variables.`,
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name of the context rule engine',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of what this rule engine does',
                        type: 'string',
                    },
                    rules: {
                        description: 'Array of rules to include in the rule engine. Each rule contains conditions and actions.',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', description: 'Rule name' },
                                description: { type: 'string', description: 'Rule description' },
                                conditions: {
                                    type: 'array',
                                    description: 'Conditions that must be met for the rule to trigger',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            variable: { type: 'string' },
                                            operator: { type: 'string' },
                                            value: {},
                                        },
                                    },
                                },
                                condition_logic: { type: 'string', enum: ['and', 'or'] },
                                action: { type: 'string', enum: ['include', 'exclude', 'force_include', 'set_priority'] },
                                action_config: { type: 'object' },
                                enabled: { type: 'boolean' },
                                order: { type: 'number' },
                            },
                            required: ['name', 'conditions', 'action'],
                        },
                    },
                    enabled: {
                        description: 'Whether the rule engine is enabled (defaults to true)',
                        type: 'boolean',
                    },
                },
                required: ['name', 'rules'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ContextRuleCreateToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }

        if (!params.rules || !Array.isArray(params.rules)) {
            return "The 'rules' parameter must be an array.";
        }

        if (params.rules.length === 0) {
            return "The 'rules' parameter must contain at least one rule.";
        }

        for (let i = 0; i < params.rules.length; i++) {
            const rule = params.rules[i];
            if (!rule.name || rule.name.trim() === '') {
                return `Rule at index ${i} must have a non-empty 'name'.`;
            }
            if (!rule.conditions || !Array.isArray(rule.conditions)) {
                return `Rule '${rule.name}' must have a 'conditions' array.`;
            }
            if (!rule.action) {
                return `Rule '${rule.name}' must have an 'action'.`;
            }
        }

        return null;
    }

    protected createInvocation(
        params: ContextRuleCreateToolParams,
    ): ToolInvocation<ContextRuleCreateToolParams, ToolResult> {
        return new ContextRuleCreateToolInvocation(params);
    }
}
