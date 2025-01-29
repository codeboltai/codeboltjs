"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("./websocket"));
const codeboltAgent = {
    /**
     * Retrieves an agent based on the specified task.
     * @param {string} task - The task for which an agent is needed.
     * @returns {Promise<AgentResponse>} A promise that resolves with the agent details.
     */
    getAgent: (task) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "getAgentByTask",
                "task": task
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
    startAgent: (task) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "agentEvent",
                "action": "startAgent",
                "task": task
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                const response = JSON.parse(data);
                if (response.type === "startAgentResponse" && response.task === task) {
                    resolve(response); // Resolve the Promise when the agent has been successfully started
                }
            });
        });
    }
};
exports.default = codeboltAgent;
