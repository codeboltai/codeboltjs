"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("./websocket"));
const codeboltMCP = {
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
    getMentionedToolBoxes: (userMessage) => {
        return new Promise((resolve, reject) => {
            resolve(userMessage.mentionedMCPs);
        });
    },
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
