/**
 * Agent List Tool - Lists all available agents
 * Wraps the SDK's codeboltAgent.getAgentsList() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgent from '../../modules/agent';
import cbchat from '../../modules/chat';

export interface AgentListParams {
    /** One sentence explanation of why this tool is being used */
    explanation?: string;
    // No required parameters
}

class AgentListInvocation extends BaseToolInvocation<AgentListParams, ToolResult> {
    constructor(params: AgentListParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            const response = await codeboltAgent.getAgentsList();

            if (response && response.success === false) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error && typeof response.error === 'object' && 'message' in response.error)
                        ? String((response.error as { message?: unknown }).message)
                        : 'Agent list failed';
                return {
                    llmContent: `Agent list failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = 'Retrieved agent list';
            if (response.agents && Array.isArray(response.agents)) {
                output += `\n\nAvailable Agents (${response.agents.length}):\n`;
                for (const agent of response.agents) {
                    const agentId = this.getAgentId(agent);
                    const agentDesc = this.getAgentDescription(agent);
                    output += `- ${agentId}: ${agentDesc}\n`;
                }
            }

            return {
                llmContent: output,
                returnDisplay: 'Retrieved agent list',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing agents: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }

    private getAgentId(agent: unknown): string {
        if (this.isAgentToolFunctionDescriptor(agent)) {
            return agent.function.name;
        }
        if (agent && typeof agent === 'object' && ('id' in agent || 'name' in agent)) {
            return String((agent as { id?: unknown; name?: unknown }).id || (agent as { id?: unknown; name?: unknown }).name);
        }
        return 'Unknown';
    }

    private getAgentDescription(agent: unknown): string {
        if (this.isAgentToolFunctionDescriptor(agent)) {
            return agent.function.description || 'No description';
        }
        if (agent && typeof agent === 'object' && 'description' in agent) {
            return String((agent as { description?: unknown }).description || 'No description');
        }
        return 'No description';
    }

    private isAgentToolFunctionDescriptor(x: unknown): x is { type: 'function'; function: { name: string; description?: string } } {
        if (!x || typeof x !== 'object') return false;
        const maybe = x as Record<string, unknown>;
        if (maybe.type !== 'function') return false;
        const fn = maybe.function as unknown;
        if (!fn || typeof fn !== 'object') return false;
        const fnRec = fn as Record<string, unknown>;
        return typeof fnRec.name === 'string';
    }
}

export class AgentListTool extends BaseDeclarativeTool<AgentListParams, ToolResult> {
    static readonly Name: string = 'agent_list';

    constructor() {
        super(
            AgentListTool.Name,
            'AgentList',
            'Lists all available agents.',
            Kind.Read,
            {
                properties: {
                    explanation: {
                        description: "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: AgentListParams): ToolInvocation<AgentListParams, ToolResult> {
        return new AgentListInvocation(params);
    }
}
