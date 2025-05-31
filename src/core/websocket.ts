import WebSocket from 'ws';
import fs from 'fs';
import yaml from 'js-yaml';
import messageManager, { MessageManager } from './messageManager';

/**
 * Class representing a WebSocket connection.
 */
class cbws {
    websocket!: WebSocket;


    /**
     * Constructs a new cbws instance and initializes the WebSocket connection.
     */
    constructor() {

        // this.websocket=undefined;
        // this.websocket = new WebSocket(`ws://localhost:${process.env.SOCKET_PORT}/codebolt?id=${uniqueConnectionId}${agentIdParam}${parentIdParam}${process.env.Is_Dev ? '&dev=true' : ''}`);
        // this.initializeWebSocket(initialMessage).catch(error => {
        //     console.error("WebSocket connection failed:", error);
        // });
    }


    private getUniqueConnectionId(): string {
        try {
            let fileContents = fs.readFileSync('./codeboltagent.yaml', 'utf8');
            let data: any = yaml.load(fileContents);
            return data.unique_connectionid;
        } catch (e) {
            console.error('Unable to locate codeboltagent.yaml file.');
            return '';
        }
    }

    private getInitialMessage(): string {
        try {
            let fileContents = fs.readFileSync('./codeboltagent.yaml', 'utf8');
            let data: any = yaml.load(fileContents);
            return data.initial_message;
        } catch (e) {
            // console.error('Unable to locate codeboltagent.yaml file.');
            return '';
        }
    }

    /**
     * Initializes the WebSocket by setting up event listeners and returning a promise that resolves
     * when the WebSocket connection is successfully opened.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance.
     */
    public async initializeWebSocket(): Promise<WebSocket> {
        const uniqueConnectionId = this.getUniqueConnectionId();
        const initialMessage = this.getInitialMessage();

        const agentIdParam = process.env.agentId ? `&agentId=${process.env.agentId}` : '';
        const parentIdParam = process.env.parentId ? `&parentId=${process.env.parentId}` : '';
        const parentAgentInstanceIdParam = process.env.parentAgentInstanceId ? `&parentAgentInstanceId=${process.env.parentAgentInstanceId}` : '';
        const agentTask = process.env.agentTask ? `&agentTask=${process.env.agentTask}` : '';
        this.websocket = new WebSocket(`ws://localhost:${process.env.SOCKET_PORT}/codebolt?id=${uniqueConnectionId}${agentIdParam}${parentIdParam}${parentAgentInstanceIdParam}${agentTask}${process.env.Is_Dev ? '&dev=true' : ''}`);

        return new Promise((resolve, reject) => {
            this.websocket.on('error', (error: Error) => {
                reject(error);
            });

            this.websocket.on('open', () => {
                // Initialize the message manager with this websocket
                messageManager.initialize(this.websocket);
                resolve(this.websocket);
            });

            this.websocket.on('close', () => {
                // Clean up pending requests when connection closes
                messageManager.cleanup();
            });
        });
    }

    /**
     * Getter for the WebSocket instance. Throws an error if the WebSocket is not open.
     * @returns {WebSocket} The WebSocket instance.
     * @throws {Error} If the WebSocket is not open.
     */
    get getWebsocket(): WebSocket {
        if (this.websocket && !this.websocket.OPEN) {
            throw new Error('WebSocket is not open');
        } else {
            return this.websocket;
        }
    }

    /**
     * Get the message manager instance
     */
    get messageManager(): MessageManager {
        return messageManager;
    }
}

export default new cbws();
