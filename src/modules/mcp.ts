import cbws from './websocket';
const codeboltMCP = {
    getMcpList: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "mcpEvent",
                "action": "getMcpList"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "getMcpListResponse") {
                        resolve(response.data);
                    } else {
                        reject(new Error("Unexpected response type"));
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
    executeTool: (mcpServer: string, toolName: string, params: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "mcpEvent",
                "action": "executeTool",
                "mcpServer": mcpServer,
                "toolName": toolName,
                "params": params
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                try {
                    const response = JSON.parse(data);
                    if (response.type === "executeToolResponse" && response.toolName === toolName) {
                        resolve(response.data);
                    } else {
                        reject(new Error("Unexpected response type"));
                    }
                } catch (error) {
                    reject(new Error("Failed to parse response"));
                }
            });
            cbws.getWebsocket.on('error', (error: Error) => {
                reject(error);
            });
        });
    }
}

export default codeboltMCP;