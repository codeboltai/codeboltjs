import { GetAgentStateResponse } from '@codebolt/types';
import cbws from './websocket';


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
     * @returns {Promise<AgentResponse>} A promise that resolves with the agent details.
     */
    findAgent: (task: string, maxResult = 1, agents = [], agentLocaltion: AgentLocation = AgentLocation.ALL, getFrom: FilterUsing.USE_VECTOR_DB): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "findAgent",
                "task": task,
                "agents": agents,// for filter in vector db
                "maxResult": maxResult,
                "location": agentLocaltion,
                "getFrom": getFrom
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "findAgentByTaskResponse") {
                    resolve(response); // Resolve the Promise with the agent details
                }
            });
        });
    },

    /**
     * Starts an agent for the specified task.
     * @param {string} task - The task for which the agent should be started.
     * @returns {Promise<void>} A promise that resolves when the agent has been successfully started.
     */
    startAgent: (agentId: string, task: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "startAgent",
                "agentId": agentId,
                "task": task
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "taskCompletionResponse" && response.agentId === agentId) {
                    resolve(response); // Resolve the Promise when the agent has been successfully started
                }
            });
        });
    },

    /**
     * Lists all available agents.
     * @returns {Promise<any>} A promise that resolves with the list of agents.
     */
    getAgentsList: (type: Agents = Agents.DOWNLOADED): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "listAgents",
                "agentType": type,

            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "listAgentsResponse") {
                    resolve(response); // Resolve the Promise with the list of agents
                }
            });
        });
    },
    /**
     * Lists all available agents.
     * @returns {Promise<any>} A promise that resolves with the list of agents.
     */
    getAgentsDetail: (agentList = []): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "agentsDetail",
                "agentList": agentList
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "listAgentsResponse") {
                    resolve(response); // Resolve the Promise with the list of agents
                }
            });
        });
    }
}


export default codeboltAgent;




