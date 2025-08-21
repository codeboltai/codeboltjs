"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
const codeboltAgent = {
    /**
     * Retrieves an agent based on the specified task.
     * @param {string} task - The task for which an agent is needed.
     * @returns {Promise<FindAgentByTaskResponse>} A promise that resolves with the agent details.
     */
    findAgent: (task, maxResult = 1, agents = [], agentLocaltion = enum_1.AgentLocation.ALL, getFrom) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.AGENT_EVENT,
            "action": enum_1.AgentAction.FIND_AGENT,
            "task": task,
            "agents": agents, // for filter in vector db
            "maxResult": maxResult,
            "location": agentLocaltion,
            "getFrom": getFrom
        }, enum_1.AgentResponseType.FIND_AGENT_BY_TASK_RESPONSE);
    },
    /**
     * Starts an agent for the specified task.
     * @param {string} task - The task for which the agent should be started.
     * @returns {Promise<TaskCompletionResponse>} A promise that resolves when the agent has been successfully started.
     */
    startAgent: (agentId, task) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.AGENT_EVENT,
            "action": enum_1.AgentAction.START_AGENT,
            "agentId": agentId,
            "task": task
        }, enum_1.AgentResponseType.TASK_COMPLETION_RESPONSE);
    },
    /**
     * Lists all available agents.
     * @returns {Promise<ListAgentsResponse>} A promise that resolves with the list of agents.
     */
    getAgentsList: (type = enum_1.Agents.DOWNLOADED) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.AGENT_EVENT,
            "action": enum_1.AgentAction.LIST_AGENTS,
            "agentType": type,
        }, enum_1.AgentResponseType.LIST_AGENTS_RESPONSE);
    },
    /**
     * Lists all available agents.
     * @returns {Promise<AgentsDetailResponse>} A promise that resolves with the list of agents.
     */
    getAgentsDetail: (agentList = []) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.AGENT_EVENT,
            "action": enum_1.AgentAction.AGENTS_DETAIL,
            "agentList": agentList
        }, enum_1.AgentResponseType.AGENTS_DETAIL_RESPONSE);
    }
};
exports.default = codeboltAgent;
