import { GetAgentStateResponse, FindAgentByTaskResponse, ListAgentsResponse, AgentsDetailResponse, TaskCompletionResponse } from '@codebolt/types/sdk';
import cbws from '../core/websocket';
import { AgentLocation, Agents, FilterUsing, EventType, AgentAction, AgentResponseType } from '@codebolt/types/enum';



const codeboltAgent = {
    /**
     * Retrieves an agent based on the specified task.
     * @param {string} task - The task for which an agent is needed.
     * @returns {Promise<FindAgentByTaskResponse>} A promise that resolves with the agent details.
     */
    findAgent: (task: string, maxResult = 1, agents = [], agentLocaltion: AgentLocation = AgentLocation.ALL, getFrom: FilterUsing.USE_VECTOR_DB): Promise<FindAgentByTaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.AGENT_EVENT,
                "action": AgentAction.FIND_AGENT,
                "task": task,
                "agents": agents,// for filter in vector db
                "maxResult": maxResult,
                "location": agentLocaltion,
                "getFrom": getFrom
            },
            AgentResponseType.FIND_AGENT_BY_TASK_RESPONSE
        );
    },

    /**
     * Starts an agent for the specified task.
     * @param {string} task - The task for which the agent should be started.
     * @returns {Promise<TaskCompletionResponse>} A promise that resolves when the agent has been successfully started.
     */
    startAgent: (agentId: string, task: string): Promise<TaskCompletionResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.AGENT_EVENT,
                "action": AgentAction.START_AGENT,
                "agentToStartId": agentId,
                "task": task
            },
            AgentResponseType.TASK_COMPLETION_RESPONSE
        );
    },

    /**
     * Lists all available agents.
     * @returns {Promise<ListAgentsResponse>} A promise that resolves with the list of agents.
     */
    getAgentsList: (type: Agents = Agents.DOWNLOADED): Promise<ListAgentsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.AGENT_EVENT,
                "action": AgentAction.LIST_AGENTS,
                "agentType": type,

            },
            AgentResponseType.LIST_AGENTS_RESPONSE
        );
    },
    /**
     * Lists all available agents.
     * @returns {Promise<AgentsDetailResponse>} A promise that resolves with the list of agents.
     */
    getAgentsDetail: (agentList?: string[]): Promise<AgentsDetailResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.AGENT_EVENT,
                "action": AgentAction.AGENTS_DETAIL,
                "agentList": agentList || []
            },
            AgentResponseType.AGENTS_DETAIL_RESPONSE
        );
    }
}

export default codeboltAgent;




