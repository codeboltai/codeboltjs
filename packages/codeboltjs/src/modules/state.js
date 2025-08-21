"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
const cbstate = {
    /**
     * Retrieves the current application state from the server via WebSocket.
     * @returns {Promise<ApplicationState>} A promise that resolves with the application state.
     */
    getApplicationState: async () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.StateEventType.PROJECT_STATE_EVENT,
            "action": enum_1.StateAction.GET_APP_STATE,
        }, enum_1.StateResponseType.GET_APP_STATE_RESPONSE);
    },
    /**
     * Adds a key-value pair to the agent's state on the server via WebSocket.
     * @param {string} key - The key to add to the agent's state.
     * @param {string} value - The value associated with the key.
     * @returns {Promise<AddToAgentStateResponse>} A promise that resolves with the response to the addition request.
     */
    addToAgentState: async (key, value) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.StateEventType.AGENT_STATE_EVENT,
            "action": enum_1.StateAction.ADD_TO_AGENT_STATE,
            payload: {
                key,
                value
            }
        }, enum_1.StateResponseType.ADD_TO_AGENT_STATE_RESPONSE);
    },
    /**
     * Retrieves the current state of the agent from the server via WebSocket.
     * @returns {Promise<GetAgentStateResponse>} A promise that resolves with the agent's state.
     */
    getAgentState: async () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.StateEventType.AGENT_STATE_EVENT,
            "action": enum_1.StateAction.GET_AGENT_STATE,
        }, enum_1.StateResponseType.GET_AGENT_STATE_RESPONSE);
    },
    /**
     * Retrieves the current project state from the server via WebSocket.
     * @returns {Promise<GetProjectStateResponse>} A promise that resolves with the project's state.
     */
    getProjectState: async () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.StateEventType.PROJECT_STATE_EVENT,
            "action": enum_1.StateAction.GET_PROJECT_STATE,
        }, enum_1.StateResponseType.GET_PROJECT_STATE_RESPONSE);
    },
    /**
     * Updates the project state on the server via WebSocket.
     * @param {string} key - The key to update in the project state.
     * @param {any} value - The value to set for the key.
     * @returns {Promise<UpdateProjectStateResponse>} A promise that resolves with the response to the update request.
     */
    updateProjectState: async (key, value) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.StateEventType.PROJECT_STATE_EVENT,
            "action": enum_1.StateAction.UPDATE_PROJECT_STATE,
            payload: {
                key,
                value
            }
        }, enum_1.StateResponseType.UPDATE_PROJECT_STATE_RESPONSE);
    }
};
exports.default = cbstate;
