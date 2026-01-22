/**
 * Agent Management Tool - Manages agents
 * Wraps the SDK's codeboltAgent methods
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgent from '../../modules/agent';
import { AgentLocation, FilterUsing } from '@codebolt/types/enum';

/**
 * Supported agent actions
 */
export type AgentActionType =
    | 'find'
    | 'start'
    | 'list'
    | 'details';

/**
 * Parameters for the AgentManagement tool
 */
export interface AgentManagementToolParams {
    /**
     * The agent action to perform
     */
    action: AgentActionType;

    /**
     * Task description (for find/start)
     */
    task?: string;

    /**
     * Agent ID (for start)
     */
    agent_id?: string;

    /**
     * List of agent IDs (for details)
     */
    agent_list?: string[];

    /**
     * Maximum results (for find)
     */
    max_results?: number;
}

class AgentManagementToolInvocation extends BaseToolInvocation<
    AgentManagementToolParams,
    ToolResult
> {
    constructor(params: AgentManagementToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const action = this.params.action;
            let response: any;
            let successMessage: string;

            switch (action) {
                case 'find':
                    if (!this.params.task) {
                        return this.createError("'task' is required for find action");
                    }
                    // findAgent requires all 5 arguments
                    response = await codeboltAgent.findAgent(
                        this.params.task,
                        this.params.max_results || 3,
                        [], // agents filter
                        AgentLocation.ALL,
                        FilterUsing.USE_VECTOR_DB
                    );
                    successMessage = `Found agents for task: ${this.params.task}`;
                    break;

                case 'start':
                    if (!this.params.agent_id) {
                        return this.createError("'agent_id' is required for start action");
                    }
                    if (!this.params.task) {
                        return this.createError("'task' is required for start action");
                    }
                    response = await codeboltAgent.startAgent(this.params.agent_id, this.params.task);
                    successMessage = `Started agent ${this.params.agent_id} with task`;
                    break;

                case 'list':
                    response = await codeboltAgent.getAgentsList();
                    successMessage = 'Retrieved agent list';
                    break;

                case 'details':
                    response = await codeboltAgent.getAgentsDetail(this.params.agent_list as any || []);
                    successMessage = 'Retrieved agent details';
                    break;

                default:
                    return this.createError(`Unknown action: ${action}`);
            }

            // Check for errors
            if (response && !response.success && response.success !== undefined) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Agent operation failed';
                return {
                    llmContent: `Agent ${action} failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.AGENT_NOT_FOUND,
                    },
                };
            }

            // Format output
            let output = successMessage;

            if (action === 'find' && response.agents) {
                output += `\n\nMatching Agents (${response.agents.length}):\n`;
                for (const agent of response.agents) {
                    output += `- ${agent.id || agent.name}: ${agent.description || 'No description'}\n`;
                    if (agent.score) output += `  Score: ${agent.score.toFixed(2)}\n`;
                }
            } else if (action === 'list' && response.agents) {
                output += `\n\nAvailable Agents (${response.agents.length}):\n`;
                for (const agent of response.agents) {
                    output += `- ${agent.id || agent.name}: ${agent.description || 'No description'}\n`;
                }
            } else if (action === 'details' && response.agents) {
                output += `\n\nAgent Details:\n`;
                for (const agent of response.agents) {
                    output += `\n--- ${agent.id || agent.name} ---\n`;
                    output += `Description: ${agent.description || 'N/A'}\n`;
                    if (agent.capabilities) output += `Capabilities: ${agent.capabilities.join(', ')}\n`;
                    if (agent.status) output += `Status: ${agent.status}\n`;
                }
            } else if (action === 'start') {
                output += `\n\nAgent started successfully.`;
                if (response.result) {
                    output += `\nResult: ${typeof response.result === 'string' ? response.result : JSON.stringify(response.result, null, 2)}`;
                }
            }

            return {
                llmContent: output,
                returnDisplay: successMessage,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error executing agent ${this.params.action}: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    private createError(message: string): ToolResult {
        return {
            llmContent: `Error: ${message}`,
            returnDisplay: `Error: ${message}`,
            error: {
                message,
                type: ToolErrorType.INVALID_TOOL_PARAMS,
            },
        };
    }
}

/**
 * Implementation of the AgentManagement tool logic
 */
export class AgentManagementTool extends BaseDeclarativeTool<
    AgentManagementToolParams,
    ToolResult
> {
    static readonly Name: string = 'agent_management';

    constructor() {
        super(
            AgentManagementTool.Name,
            'AgentManagement',
            `Manages agents - find agents for tasks, start agents, list available agents, and get agent details. Use this for multi-agent coordination.`,
            Kind.Other,
            {
                properties: {
                    action: {
                        description:
                            "The agent action: 'find', 'start', 'list', or 'details'.",
                        type: 'string',
                        enum: ['find', 'start', 'list', 'details'],
                    },
                    task: {
                        description:
                            'Task description (required for find/start).',
                        type: 'string',
                    },
                    agent_id: {
                        description:
                            'Agent ID (required for start).',
                        type: 'string',
                    },
                    agent_list: {
                        description:
                            'List of agent IDs (for details).',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    max_results: {
                        description:
                            'Maximum number of results (for find, default: 3).',
                        type: 'number',
                    },
                },
                required: ['action'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: AgentManagementToolParams,
    ): string | null {
        const validActions = ['find', 'start', 'list', 'details'];
        if (!validActions.includes(params.action)) {
            return `Invalid action: ${params.action}. Must be one of: ${validActions.join(', ')}`;
        }

        switch (params.action) {
            case 'find':
                if (!params.task) {
                    return "'task' is required for find action";
                }
                break;
            case 'start':
                if (!params.agent_id) {
                    return "'agent_id' is required for start action";
                }
                if (!params.task) {
                    return "'task' is required for start action";
                }
                break;
        }

        return null;
    }

    protected createInvocation(
        params: AgentManagementToolParams,
    ): ToolInvocation<AgentManagementToolParams, ToolResult> {
        return new AgentManagementToolInvocation(params);
    }
}
