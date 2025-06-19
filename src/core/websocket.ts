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
        console.log('[WebSocket] Initializing cbws instance');
        // this.websocket=undefined;
        // this.websocket = new WebSocket(`ws://localhost:${process.env.SOCKET_PORT}/codebolt?id=${uniqueConnectionId}${agentIdParam}${parentIdParam}${process.env.Is_Dev ? '&dev=true' : ''}`);
        // this.initializeWebSocket(initialMessage).catch(error => {
        //     console.error("WebSocket connection failed:", error);
        // });
    }

    private getUniqueConnectionId(): string {
        try {
            console.log('[WebSocket] Reading unique connection ID from codeboltagent.yaml');
            let fileContents = fs.readFileSync('./codeboltagent.yaml', 'utf8');
            let data: any = yaml.load(fileContents);
            const connectionId = data.unique_connectionid;
            console.log('[WebSocket] Successfully retrieved connection ID:', connectionId);
            return connectionId;
        } catch (e) {
            console.error('[WebSocket] Unable to locate codeboltagent.yaml file:', e);
            return '';
        }
    }

    private getInitialMessage(): string {
        try {
            console.log('[WebSocket] Reading initial message from codeboltagent.yaml');
            let fileContents = fs.readFileSync('./codeboltagent.yaml', 'utf8');
            let data: any = yaml.load(fileContents);
            const initialMessage = data.initial_message;
            console.log('[WebSocket] Successfully retrieved initial message');
            return initialMessage;
        } catch (e) {
            console.warn('[WebSocket] Unable to locate codeboltagent.yaml file for initial message:', e);
            return '';
        }
    }

    /**
     * Initializes the WebSocket by setting up event listeners and returning a promise that resolves
     * when the WebSocket connection is successfully opened.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance.
     */
    public async initializeWebSocket(): Promise<WebSocket> {
        console.log('[WebSocket] Starting WebSocket initialization');
        
        const uniqueConnectionId = this.getUniqueConnectionId();
        const initialMessage = this.getInitialMessage();

        const agentIdParam = process.env.agentId ? `&agentId=${process.env.agentId}` : '';
        const parentIdParam = process.env.parentId ? `&parentId=${process.env.parentId}` : '';
        const parentAgentInstanceIdParam = process.env.parentAgentInstanceId ? `&parentAgentInstanceId=${process.env.parentAgentInstanceId}` : '';
        const agentTask = process.env.agentTask ? `&agentTask=${process.env.agentTask}` : '';
        const socketPort = process.env.SOCKET_PORT || '12345';
        
        const wsUrl = `ws://localhost:${socketPort}/codebolt?id=${uniqueConnectionId}${agentIdParam}${parentIdParam}${parentAgentInstanceIdParam}${agentTask}${process.env.Is_Dev ? '&dev=true' : ''}`;
        console.log('[WebSocket] Connecting to:', wsUrl);
        
        this.websocket = new WebSocket(wsUrl);

        return new Promise((resolve, reject) => {
            this.websocket.on('error', (error: Error) => {
                console.error('[WebSocket] Connection error:', error);
                reject(error);
            });

            this.websocket.on('open', () => {
                console.log('[WebSocket] Connection opened successfully');
                // Initialize the message manager with this websocket
                console.log('[WebSocket] Initializing message manager');
                messageManager.initialize(this.websocket);
                resolve(this.websocket);
            });

            this.websocket.on('close', (code: number, reason: Buffer) => {
                console.log(`[WebSocket] Connection closed with code: ${code}, reason: ${reason.toString()}`);
                // Clean up pending requests when connection closes
                console.log('[WebSocket] Cleaning up message manager');
                messageManager.cleanup();
            });

            this.websocket.on('message', (data: WebSocket.Data) => {
                console.log('[WebSocket] Message received:', data.toString().substring(0, 100) + (data.toString().length > 100 ? '...' : ''));
            });

            this.websocket.on('ping', () => {
                console.log('[WebSocket] Ping received');
            });

            this.websocket.on('pong', () => {
                console.log('[WebSocket] Pong received');
            });
        });
    }

    /**
     * Getter for the WebSocket instance. Throws an error if the WebSocket is not open.
     * @returns {WebSocket} The WebSocket instance.
     * @throws {Error} If the WebSocket is not open.
     */
    get getWebsocket(): WebSocket {
        if (this.websocket && this.websocket.readyState !== WebSocket.OPEN) {
            console.error('[WebSocket] Attempted to access WebSocket but it is not open. Ready state:', this.websocket.readyState);
            throw new Error('WebSocket is not open');
        } else {
            console.log('[WebSocket] WebSocket access - ready state:', this.websocket?.readyState);
            return this.websocket;
        }
    }

    /**
     * Get the message manager instance
     */
    get messageManager(): MessageManager {
        console.log('[WebSocket] Accessing message manager');
        return messageManager;
    }
}

console.log('[WebSocket] Creating cbws singleton instance');
export default new cbws();
