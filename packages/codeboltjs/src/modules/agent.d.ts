import { FindAgentByTaskResponse, ListAgentsResponse, AgentsDetailResponse, TaskCompletionResponse } from '@codebolt/types/sdk';
import { AgentLocation, Agents, FilterUsing } from '@codebolt/types/enum';
declare const codeboltAgent: {
    /**
     * Retrieves an agent based on the specified task.
     * @param {string} task - The task for which an agent is needed.
     * @returns {Promise<FindAgentByTaskResponse>} A promise that resolves with the agent details.
     */
    findAgent: (task: string, maxResult: number | undefined, agents: never[] | undefined, agentLocaltion: AgentLocation, getFrom: FilterUsing.USE_VECTOR_DB) => Promise<FindAgentByTaskResponse>;
    /**
     * Starts an agent for the specified task.
     * @param {string} task - The task for which the agent should be started.
     * @returns {Promise<TaskCompletionResponse>} A promise that resolves when the agent has been successfully started.
     */
    startAgent: (agentId: string, task: string) => Promise<TaskCompletionResponse>;
    /**
     * Lists all available agents.
     * @returns {Promise<ListAgentsResponse>} A promise that resolves with the list of agents.
     */
    getAgentsList: (type?: Agents) => Promise<ListAgentsResponse>;
    /**
     * Lists all available agents.
     * @returns {Promise<AgentsDetailResponse>} A promise that resolves with the list of agents.
     */
    getAgentsDetail: (agentList?: never[]) => Promise<AgentsDetailResponse>;
};
export default codeboltAgent;
