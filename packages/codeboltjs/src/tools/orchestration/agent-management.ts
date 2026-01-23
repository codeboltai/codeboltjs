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
import type {
    FindAgentByTaskResponse,
    ListAgentsResponse,
    AgentsDetailResponse,
    TaskCompletionResponse,
} from '@codebolt/types/sdk';

type AgentToolFunctionDescriptor = {
    type: 'function';
    function: {
        name: string;
        description?: string;
        parameters?: unknown;
        // allow additional fields without losing type safety on the ones we use
        [key: string]: unknown;
    };
    [key: string]: unknown;
};

function isAgentToolFunctionDescriptor(x: unknown): x is AgentToolFunctionDescriptor {
    if (!x || typeof x !== 'object') return false;
    const maybe = x as Record<string, unknown>;
    if (maybe.type !== 'function') return false;
    const fn = maybe.function as unknown;
    if (!fn || typeof fn !== 'object') return false;
    const fnRec = fn as Record<string, unknown>;
    return typeof fnRec.name === 'string';
}

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
            let response: FindAgentByTaskResponse | ListAgentsResponse | AgentsDetailResponse | TaskCompletionResponse;
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
                    response = await codeboltAgent.getAgentsDetail(this.params.agent_list || []);
                    successMessage = 'Retrieved agent details';
                    break;

                default:
                    return this.createError(`Unknown action: ${action}`);
            }

            // Check for errors with strict type checking
            if (response && response.success === false) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error && typeof response.error === 'object' && 'message' in response.error)
                        ? String((response.error as { message?: unknown }).message)
                        : 'Agent operation failed';
                return {
                    llmContent: `Agent ${action} failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.AGENT_NOT_FOUND,
                    },
                };
            }

            // Format output with strict type checking
            let output = successMessage;

            if (action === 'find') {
                const findResponse = response as FindAgentByTaskResponse;
                if (findResponse.agents && Array.isArray(findResponse.agents)) {
                    output += `\n\nMatching Agents (${findResponse.agents.length}):\n`;
                    for (const agent of findResponse.agents) {
                        // findAgent commonly returns the same tool/function descriptor shape as listAgents
                        const agentId = isAgentToolFunctionDescriptor(agent)
                            ? agent.function.name
                            : (agent && typeof agent === 'object' && ('id' in agent || 'name' in agent))
                                ? String((agent as { id?: unknown; name?: unknown }).id || (agent as { id?: unknown; name?: unknown }).name)
                                : 'Unknown';
                        const agentDesc = isAgentToolFunctionDescriptor(agent)
                            ? (agent.function.description || 'No description')
                            : (agent && typeof agent === 'object' && 'description' in agent)
                                ? String((agent as { description?: unknown }).description || 'No description')
                                : 'No description';
                        output += `- ${agentId}: ${agentDesc}\n`;
                        if (agent && typeof agent === 'object' && 'score' in agent && typeof (agent as { score?: unknown }).score === 'number') {
                            output += `  Score: ${((agent as { score: number }).score).toFixed(2)}\n`;
                        }
                    }
                }
            } else if (action === 'list') {
                const listResponse = response as ListAgentsResponse;
                if (listResponse.agents && Array.isArray(listResponse.agents)) {
                    output += `\n\nAvailable Agents (${listResponse.agents.length}):\n`;
                    for (const agent of listResponse.agents) {
                        const agentId = isAgentToolFunctionDescriptor(agent)
                            ? agent.function.name
                            : (agent && typeof agent === 'object' && ('id' in agent || 'name' in agent))
                                ? String((agent as { id?: unknown; name?: unknown }).id || (agent as { id?: unknown; name?: unknown }).name)
                                : 'Unknown';
                        const agentDesc = isAgentToolFunctionDescriptor(agent)
                            ? (agent.function.description || 'No description')
                            : (agent && typeof agent === 'object' && 'description' in agent)
                                ? String((agent as { description?: unknown }).description || 'No description')
                                : 'No description';
                        output += `- ${agentId}: ${agentDesc}\n`;
                    }
                }
            } else if (action === 'details') {
                const detailResponse = response as AgentsDetailResponse;
                const agents = detailResponse.payload?.agents;
                if (agents && Array.isArray(agents)) {
                    output += `\n\nAgent Details:\n`;
                    for (const agent of agents) {
                        if (agent && typeof agent === 'object') {
                            const agentId = ('id' in agent || 'name' in agent)
                                ? String((agent as { id?: unknown; name?: unknown }).id || (agent as { id?: unknown; name?: unknown }).name)
                                : 'Unknown';
                            output += `\n--- ${agentId} ---\n`;
                            const agentDesc = ('description' in agent)
                                ? String((agent as { description?: unknown }).description || 'N/A')
                                : 'N/A';
                            output += `Description: ${agentDesc}\n`;
                            if ('capabilities' in agent && Array.isArray((agent as { capabilities?: unknown }).capabilities)) {
                                const capabilities = (agent as { capabilities: unknown[] }).capabilities;
                                output += `Capabilities: ${capabilities.map(c => String(c)).join(', ')}\n`;
                            }
                            if ('status' in agent) {
                                output += `Status: ${String((agent as { status?: unknown }).status)}\n`;
                            }
                        }
                    }
                }
            } else if (action === 'start') {
                const startResponse = response as TaskCompletionResponse;
                output += `\n\nAgent started successfully.`;
                if (startResponse.result !== undefined) {
                    output += `\nResult: ${typeof startResponse.result === 'string' ? startResponse.result : JSON.stringify(startResponse.result, null, 2)}`;
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
