/**
 * Context Rule List Tool - Lists all context rule engines
 * Wraps the SDK's contextRuleEngine.list() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import contextRuleEngine from '../../modules/contextRuleEngine';

/**
 * Parameters for the ContextRuleList tool
 */
export interface ContextRuleListToolParams {
    // No parameters needed for listing
}

class ContextRuleListToolInvocation extends BaseToolInvocation<
    ContextRuleListToolParams,
    ToolResult
> {
    constructor(params: ContextRuleListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await contextRuleEngine.list();

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing context rules: ${errorMsg}`,
                    returnDisplay: `Error listing context rules: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const ruleEngines = response.data?.ruleEngines || [];

            if (ruleEngines.length === 0) {
                return {
                    llmContent: 'No context rule engines found.',
                    returnDisplay: 'No context rule engines found.',
                };
            }

            const engineSummaries = ruleEngines.map((engine) => {
                return `- ID: ${engine.id}\n  Name: ${engine.name}\n  Description: ${engine.description || 'N/A'}\n  Enabled: ${engine.enabled}\n  Rules count: ${engine.rules?.length || 0}\n  Created: ${engine.createdAt}\n  Updated: ${engine.updatedAt}`;
            });

            const llmContent = `Found ${ruleEngines.length} context rule engine(s):\n\n${engineSummaries.join('\n\n')}`;

            return {
                llmContent,
                returnDisplay: `Found ${ruleEngines.length} context rule engine(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing context rules: ${errorMessage}`,
                returnDisplay: `Error listing context rules: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ContextRuleList tool logic
 */
export class ContextRuleListTool extends BaseDeclarativeTool<
    ContextRuleListToolParams,
    ToolResult
> {
    static readonly Name: string = 'context_rule_list';

    constructor() {
        super(
            ContextRuleListTool.Name,
            'ContextRuleList',
            `Lists all context rule engines. Returns information about each rule engine including its ID, name, description, enabled status, rules count, and timestamps.`,
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: ContextRuleListToolParams,
    ): ToolInvocation<ContextRuleListToolParams, ToolResult> {
        return new ContextRuleListToolInvocation(params);
    }
}
