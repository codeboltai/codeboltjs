"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("./websocket"));
/**
 * Object containing methods for interacting with Codebolt MCP (Model Context Protocol) tools.
 * Provides functionality to discover, list, and execute tools.
 */
const codeboltMCP = {
    /**
     * Gets the list of currently enabled toolboxes.
     *
     * @returns Promise with the enabled toolboxes data
     */
    getEnabledToolBoxes: () => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "getEnabledToolBoxes"
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getEnabledToolBoxesResponse") {
                        resolve(response.data);
                    }
                }
                catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            websocket_1.default.getWebsocket.on('error', (error) => {
                reject(error);
            });
        });
    },
    /**
     * Gets the list of locally available toolboxes.
     *
     * @returns Promise with the local toolboxes data
     */
    getLocalToolBoxes: () => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "getLocalToolBoxes"
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getLocalToolBoxesResponse") {
                        resolve(response.data);
                    }
                }
                catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            websocket_1.default.getWebsocket.on('error', (error) => {
                reject(error);
            });
        });
    },
    /**
     * Gets toolboxes mentioned in a user message.
     *
     * @param userMessage - The user message to extract mentions from
     * @returns Promise with the mentioned toolboxes
     */
    getMentionedToolBoxes: (userMessage) => {
        return new Promise((resolve, reject) => {
            resolve(userMessage.mentionedMCPs);
        });
    },
    /**
     * Gets all available toolboxes.
     *
     * @returns Promise with all available toolboxes data
     */
    getAvailableToolBoxes: () => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "getAvailableToolBoxes"
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getAvailableToolBoxesResponse") {
                        resolve(response.data);
                    }
                }
                catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            websocket_1.default.getWebsocket.on('error', (error) => {
                reject(error);
            });
        });
    },
    /**
     * Searches for available toolboxes matching a query.
     *
     * @param query - The search query string
     * @returns Promise with matching toolboxes data
     */
    searchAvailableToolBoxes: (query) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "searchAvailableToolBoxes",
                "query": query
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "searchAvailableToolBoxesResponse") {
                        resolve(response.data);
                    }
                }
                catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            websocket_1.default.getWebsocket.on('error', (error) => {
                reject(error);
            });
        });
    },
    /**
     * Lists all tools from the specified toolboxes.
     *
     * @param toolBoxes - Array of toolbox names to list tools from
     * @returns Promise with tools from the specified toolboxes
     */
    listToolsFromToolBoxes: (toolBoxes) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "listToolsFromToolBoxes",
                "toolBoxes": toolBoxes
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "listToolsFromToolBoxesResponse") {
                        resolve(response.data);
                    }
                }
                catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            websocket_1.default.getWebsocket.on('error', (error) => {
                reject(error);
            });
        });
    },
    /**
     * Configures a specific toolbox with provided configuration.
     *
     * @param name - The name of the toolbox to configure
     * @param config - Configuration object for the toolbox
     * @returns Promise with the configuration result
     */
    configureToolBox: (name, config) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "configureToolBox",
                "mcpName": name,
                "config": config
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "configureToolBoxResponse") {
                        resolve(response.data);
                    }
                }
                catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            websocket_1.default.getWebsocket.on('error', (error) => {
                reject(error);
            });
        });
    },
    /**
     * Gets detailed information about specific tools.
     *
     * @param tools - Array of toolbox and tool name pairs
     * @returns Promise with detailed information about the tools
     */
    getTools: (tools) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "getTools",
                "toolboxes": tools
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getToolsResponse") {
                        resolve(response.data);
                    }
                }
                catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            websocket_1.default.getWebsocket.on('error', (error) => {
                reject(error);
            });
        });
    },
    /**
     * Executes a specific tool with provided parameters.
     *
     * @param toolbox - The name of the toolbox containing the tool
     * @param toolName - The name of the tool to execute
     * @param params - Parameters to pass to the tool
     * @returns Promise with the execution result
     */
    executeTool: (toolbox, toolName, params) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "executeTool",
                "toolName": `${toolbox}--${toolName}`,
                "params": params
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "executeToolResponse") {
                        resolve(response.data);
                    }
                }
                catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            websocket_1.default.getWebsocket.on('error', (error) => {
                reject(error);
            });
        });
    },
};
exports.default = codeboltMCP;
