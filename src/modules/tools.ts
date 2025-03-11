import { UserMessage } from '../utils';
import cbws from './websocket';
const codeboltMCP = {
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
    getMentionedToolBoxes: (userMessage: UserMessage): Promise<any> => {
        return new Promise((resolve, reject) => {
            resolve(userMessage.mentionedMCPs);
        });
    },
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