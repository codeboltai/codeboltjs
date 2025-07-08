import { GetAgentStateResponse, FindAgentByTaskResponse, ListAgentsResponse, AgentsDetailResponse, TaskCompletionResponse } from '../types/cliWebSocketInterfaces';
import cbws from '../core/websocket';


export enum AgentLocation {
    ALL = 'all',
    LOCAL_ONLY = 'local_only',
    REMOTE_ONLY = 'remote_only',
}


export enum Agents {
    LOCAL = 'local',
    ALL = 'all',
    DOWNLOADED = 'downloaded',
}

export enum FilterUsing {
    USE_AI = 'use_ai',
    USE_VECTOR_DB = 'use_vector_db',
    USE_BOTH = 'use_both',
}



const codeboltAgent = {
    /**
     * Retrieves an agent based on the specified task.
     * @param {string} task - The task for which an agent is needed.
     * @returns {Promise<FindAgentByTaskResponse>} A promise that resolves with the agent details.
     */
    findAgent: (task: string, maxResult = 1, agents = [], agentLocaltion: AgentLocation = AgentLocation.ALL, getFrom: FilterUsing.USE_VECTOR_DB): Promise<FindAgentByTaskResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "agentEvent",
                "action": "findAgent",
                "task": task,
                "agents": agents,// for filter in vector db
                "maxResult": maxResult,
                "location": agentLocaltion,
                "getFrom": getFrom
            },
            "findAgentByTaskResponse"
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
                "type": "agentEvent",
                "action": "startAgent",
                "agentId": agentId,
                "task": task
            },
            "taskCompletionResponse"
        );
    },

    /**
     * Lists all available agents.
     * @returns {Promise<ListAgentsResponse>} A promise that resolves with the list of agents.
     */
    getAgentsList: (type: Agents = Agents.DOWNLOADED): Promise<ListAgentsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "agentEvent",
                "action": "listAgents",
                "agentType": type,

            },
            "listAgentsResponse"
        );
    },
    /**
     * Lists all available agents.
     * @returns {Promise<AgentsDetailResponse>} A promise that resolves with the list of agents.
     */
    getAgentsDetail: (agentList = []): Promise<AgentsDetailResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "agentEvent",
                "action": "agentsDetail",
                "agentList": agentList
            },
            "agentsDetailResponse"
        );
    }
}

export default codeboltAgent;




