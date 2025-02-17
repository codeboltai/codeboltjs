"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agents = exports.AgentLocation = void 0;
const websocket_1 = __importDefault(require("./websocket"));
var AgentLocation;
(function (AgentLocation) {
    AgentLocation["ALL"] = "all";
    AgentLocation["LOCAL_ONLY"] = "local_only";
    AgentLocation["REMOTE_ONLY"] = "remote_only";
})(AgentLocation || (exports.AgentLocation = AgentLocation = {}));
var Agents;
(function (Agents) {
    Agents["LOCAL"] = "local";
    Agents["ALL"] = "all";
    Agents["DOWNLOADED"] = "downloaded";
})(Agents || (exports.Agents = Agents = {}));
const codeboltAgent = {
    /**
     * Retrieves an agent based on the specified task.
     * @param {string} task - The task for which an agent is needed.
     * @returns {Promise<AgentResponse>} A promise that resolves with the agent details.
     */
    findAgent: (task, maxResult = 1, agents = [], agentLocaltion = AgentLocation.ALL) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "getAgentByTask",
                "task": task,
                "agents": agents,
                "maxResult": maxResult,
                "location": agentLocaltion
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                const response = JSON.parse(data);
                if (response.type === "getAgentByTaskResponse") {
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
    startAgent: (agentId, task) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "startAgent",
                "agentId": agentId,
                "task": task
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                const response = JSON.parse(data);
                if (response.type === "taskCompletionResponse") {
                    resolve(response); // Resolve the Promise when the agent has been successfully started
                }
            });
        });
    },
    /**
     * Lists all available agents.
     * @returns {Promise<any>} A promise that resolves with the list of agents.
     */
    getAgentsList: (type = Agents.DOWNLOADED) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "listAgents",
                "agentType": type,
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
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
    getAgentsDetail: (agentList = []) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "agentsDetail",
                "agentList": agentList
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                const response = JSON.parse(data);
                if (response.type === "listAgentsResponse") {
                    resolve(response); // Resolve the Promise with the list of agents
                }
            });
        });
    }
};
exports.default = codeboltAgent;
