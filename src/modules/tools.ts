import { UserMessage } from '../utils';
import cbws from './websocket';

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
    getEnabledToolBoxes: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "getEnabledToolBoxes"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getEnabledToolBoxesResponse") {
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
                reject(error);
            });
        });
    },

    /**
     * Gets the list of locally available toolboxes.
     * 
     * @returns Promise with the local toolboxes data
     */
    getLocalToolBoxes: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "getLocalToolBoxes"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getLocalToolBoxesResponse") {
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
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
    getMentionedToolBoxes: (userMessage: UserMessage): Promise<any> => {
        return new Promise((resolve, reject) => {
            resolve(userMessage.mentionedMCPs);
        });
    },

    /**
     * Gets all available toolboxes.
     * 
     * @returns Promise with all available toolboxes data
     */
    getAvailableToolBoxes: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "getAvailableToolBoxes"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getAvailableToolBoxesResponse") {
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
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
    searchAvailableToolBoxes: (query: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "searchAvailableToolBoxes",
                "query": query
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "searchAvailableToolBoxesResponse") {
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
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
    listToolsFromToolBoxes: (toolBoxes: string[]): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "listToolsFromToolBoxes",
                "toolBoxes": toolBoxes
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "listToolsFromToolBoxesResponse") {
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
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
    configureToolBox: (name: string, config: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "configureToolBox",
                "mcpName": name,
                "config": config
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "configureToolBoxResponse") {
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
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
    getTools: (tools: { toolbox: string, toolName: string }[]): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "getTools",
                "toolboxes": tools
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getToolsResponse") {
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
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
    executeTool: (toolbox: string, toolName: string, params: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "codebolttools",
                "action": "executeTool",
                "toolName": `${toolbox}--${toolName}`,
                "params": params
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "executeToolResponse") {
                        resolve(response.data);
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
                reject(error);
            });
        });
    },
}

export default codeboltMCP;