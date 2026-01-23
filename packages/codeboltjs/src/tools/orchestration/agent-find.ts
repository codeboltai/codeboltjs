/**
 * Agent Find Tool - Finds agents for a task
 * Wraps the SDK's codeboltAgent.findAgent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgent from '../../modules/agent';
import { AgentLocation, FilterUsing } from '@codebolt/types/enum';

export interface AgentFindParams {
    /** Task description to find agents for */
    task: string;
    /** Maximum number of results */
    max_results?: number;
}

class AgentFindInvocation extends BaseToolInvocation<AgentFindParams, ToolResult> {
    constructor(params: AgentFindParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgent.findAgent(
                this.params.task,
                this.params.max_results || 3,
                [],
                AgentLocation.ALL,
                FilterUsing.USE_VECTOR_DB
            );

            if (response && response.success === false) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error && typeof response.error === 'object' && 'message' in response.error)
                        ? String((response.error as { message?: unknown }).message)
                        : 'Agent find failed';
                return {
                    llmContent: `Agent find failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.AGENT_NOT_FOUND,
                    },
                };
            }

            let output = `Found agents for task: ${this.params.task}`;
            if (response.agents && Array.isArray(response.agents)) {
                output += `\n\nMatching Agents (${response.agents.length}):\n`;
                for (const agent of response.agents) {
                    const agentId = this.getAgentId(agent);
                    const agentDesc = this.getAgentDescription(agent);
                    output += `- ${agentId}: ${agentDesc}\n`;
                    if (agent && typeof agent === 'object' && 'score' in agent && typeof (agent as { score?: unknown }).score === 'number') {
                        output += `  Score: ${((agent as { score: number }).score).toFixed(2)}\n`;
                    }
                }
            }

            return {
                llmContent: output,
                returnDisplay: `Found agents for task: ${this.params.task}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error finding agents: ${errorMessage}`,
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

export class AgentFindTool extends BaseDeclarativeTool<AgentFindParams, ToolResult> {
    static readonly Name: string = 'agent_find';

    constructor() {
        super(
            AgentFindTool.Name,
            'AgentFind',
            'Finds agents suitable for a given task.',
            Kind.Read,
            {
                properties: {
                    task: {
                        description: 'The task description to find agents for.',
                        type: 'string',
                    },
                    max_results: {
                        description: 'Maximum number of results (default: 3).',
                        type: 'number',
                    },
                },
                required: ['task'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: AgentFindParams): string | null {
        if (!params.task || params.task.trim() === '') {
            return "'task' is required for agent find";
        }
        return null;
    }

    protected createInvocation(params: AgentFindParams): ToolInvocation<AgentFindParams, ToolResult> {
        return new AgentFindInvocation(params);
    }
}
