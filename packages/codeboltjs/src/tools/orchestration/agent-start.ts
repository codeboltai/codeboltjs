/**
 * Agent Start Tool - Starts an agent with a task
 * Wraps the SDK's codeboltAgent.startAgent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltAgent from '../../modules/agent';

export interface AgentStartParams {
    /** The agent ID to start */
    agent_id: string;
    /** The task for the agent */
    task: string;
}

class AgentStartInvocation extends BaseToolInvocation<AgentStartParams, ToolResult> {
    constructor(params: AgentStartParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltAgent.startAgent(this.params.agent_id, this.params.task);

            if (response && response.success === false) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error && typeof response.error === 'object' && 'message' in response.error)
                        ? String((response.error as { message?: unknown }).message)
                        : 'Agent start failed';
                return {
                    llmContent: `Agent start failed: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.AGENT_NOT_FOUND,
                    },
                };
            }

            let output = `Started agent ${this.params.agent_id} with task`;
            output += `\n\nAgent started successfully.`;
            if (response.result !== undefined) {
                output += `\nResult: ${typeof response.result === 'string' ? response.result : JSON.stringify(response.result, null, 2)}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Started agent ${this.params.agent_id} with task`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error starting agent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class AgentStartTool extends BaseDeclarativeTool<AgentStartParams, ToolResult> {
    static readonly Name: string = 'agent_start';

    constructor() {
        super(
            AgentStartTool.Name,
            'AgentStart',
            'Starts an agent with a specific task.',
            Kind.Execute,
            {
                properties: {
                    agent_id: {
                        description: 'The ID of the agent to start.',
                        type: 'string',
                    },
                    task: {
                        description: 'The task for the agent to execute.',
                        type: 'string',
                    },
                },
                required: ['agent_id', 'task'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: AgentStartParams): string | null {
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "'agent_id' is required for agent start";
        }
        if (!params.task || params.task.trim() === '') {
            return "'task' is required for agent start";
        }
        return null;
    }

    protected createInvocation(params: AgentStartParams): ToolInvocation<AgentStartParams, ToolResult> {
        return new AgentStartInvocation(params);
    }
}
