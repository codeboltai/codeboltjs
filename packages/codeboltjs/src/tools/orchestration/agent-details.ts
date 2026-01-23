/**
 * Agent Details Tool - Gets details of specific agents
 * Wraps the SDK's codeboltAgent.getAgentsDetail() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgent from '../../modules/agent';

export interface AgentDetailsParams {
    /** List of agent IDs to get details for */
    agent_list?: string[];
}

class AgentDetailsInvocation extends BaseToolInvocation<AgentDetailsParams, ToolResult> {
    constructor(params: AgentDetailsParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgent.getAgentsDetail(this.params.agent_list || []);

            if (response && response.success === false) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error && typeof response.error === 'object' && 'message' in response.error)
                        ? String((response.error as { message?: unknown }).message)
                        : 'Agent details failed';
                return {
                    llmContent: `Agent details failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.AGENT_NOT_FOUND,
                    },
                };
            }

            let output = 'Retrieved agent details';
            const agents = response.payload?.agents;
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

            return {
                llmContent: output,
                returnDisplay: 'Retrieved agent details',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting agent details: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class AgentDetailsTool extends BaseDeclarativeTool<AgentDetailsParams, ToolResult> {
    static readonly Name: string = 'agent_details';

    constructor() {
        super(
            AgentDetailsTool.Name,
            'AgentDetails',
            'Retrieves details of specific agents.',
            Kind.Read,
            {
                properties: {
                    agent_list: {
                        description: 'List of agent IDs to get details for.',
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: AgentDetailsParams): ToolInvocation<AgentDetailsParams, ToolResult> {
        return new AgentDetailsInvocation(params);
    }
}
