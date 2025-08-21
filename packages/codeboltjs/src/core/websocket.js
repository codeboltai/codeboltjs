"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const messageManager_1 = __importDefault(require("./messageManager"));
/**
 * Class representing a WebSocket connection.
 */
class cbws {
    /**
     * Constructs a new cbws instance and initializes the WebSocket connection.
     */
    constructor() {
        this.initialized = false;
        console.log('[WebSocket] Initializing cbws instance');
        // this.websocket=undefined;
        // this.websocket = new WebSocket(`ws://localhost:${process.env.SOCKET_PORT}/codebolt?id=${uniqueConnectionId}${agentIdParam}${parentIdParam}${process.env.Is_Dev ? '&dev=true' : ''}`);
        // this.initializeWebSocket(initialMessage).catch(error => {
        //     console.error("WebSocket connection failed:", error);
        // });
    }
    getUniqueConnectionId() {
        try {
            console.log('[WebSocket] Reading unique connection ID from codeboltagent.yaml');
            let fileContents = fs_1.default.readFileSync('./codeboltagent.yaml', 'utf8');
            let data = js_yaml_1.default.load(fileContents);
            const connectionId = data.unique_connectionid;
            console.log('[WebSocket] Successfully retrieved connection ID:', connectionId);
            return connectionId;
        }
        catch (e) {
            console.error('[WebSocket] Unable to locate codeboltagent.yaml file:', e);
            return '';
        }
    }
    getInitialMessage() {
        try {
            console.log('[WebSocket] Reading initial message from codeboltagent.yaml');
            let fileContents = fs_1.default.readFileSync('./codeboltagent.yaml', 'utf8');
            let data = js_yaml_1.default.load(fileContents);
            const initialMessage = data.initial_message;
            console.log('[WebSocket] Successfully retrieved initial message');
            return initialMessage;
        }
        catch (e) {
            console.warn('[WebSocket] Unable to locate codeboltagent.yaml file for initial message:', e);
            return '';
        }
    }
    /**
     * Initializes the WebSocket by setting up event listeners and returning a promise that resolves
     * when the WebSocket connection is successfully opened.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance.
     */
    async initializeWebSocket() {
        console.log('[WebSocket] Starting WebSocket initialization');
        const uniqueConnectionId = this.getUniqueConnectionId();
        const initialMessage = this.getInitialMessage();
        const agentIdParam = process.env.agentId ? `&agentId=${process.env.agentId}` : '';
        const parentIdParam = process.env.parentId ? `&parentId=${process.env.parentId}` : '';
        const parentAgentInstanceIdParam = process.env.parentAgentInstanceId ? `&parentAgentInstanceId=${process.env.parentAgentInstanceId}` : '';
        const agentTask = process.env.agentTask ? `&agentTask=${process.env.agentTask}` : '';
        const socketPort = process.env.SOCKET_PORT || '12345';
        const serverUrl = process.env.CODEBOLT_SERVER_URL || 'localhost';
        const threadToken = process.env.threadToken || null;
        console.log('[WebSocket] Logging all relevant variables:');
        console.log('uniqueConnectionId:', uniqueConnectionId);
        console.log('initialMessage:', initialMessage);
        console.log('agentIdParam:', agentIdParam);
        console.log('parentIdParam:', parentIdParam);
        console.log('parentAgentInstanceIdParam:', parentAgentInstanceIdParam);
        console.log('agentTask:', agentTask);
        console.log('socketPort:', socketPort);
        console.log('serverUrl:', serverUrl);
        console.log('threadToken:', threadToken);
        console.log('[WebSocket] Environment variables check:');
        console.log('process.env.agentId:', process.env.agentId);
        console.log('process.env.threadToken:', process.env.threadToken);
        console.log('process.env.parentId:', process.env.parentId);
        console.log('process.env.agentTask:', process.env.agentTask);
        const threadTokenParam = threadToken ? `&threadToken=${encodeURIComponent(threadToken)}` : '';
        // Add all custom environment variables as URL parameters
        const knownEnvVars = ['SOCKET_PORT', 'CODEBOLT_SERVER_URL', 'agentId', 'parentId', 'parentAgentInstanceId', 'agentTask', 'threadToken', 'Is_Dev', 'PATH', 'NODE_ENV', 'HOME', 'USER', 'SHELL'];
        let customParams = '';
        for (const [key, value] of Object.entries(process.env)) {
            if (!knownEnvVars.includes(key) && value && !key.startsWith('npm_') && !key.startsWith('_')) {
                customParams += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }
        }
        const wsUrl = `ws://${serverUrl}:${socketPort}/codebolt?id=${uniqueConnectionId}${agentIdParam}${parentIdParam}${parentAgentInstanceIdParam}${agentTask}${threadTokenParam}${customParams}${process.env.Is_Dev ? '&dev=true' : ''}`;
        console.log('[WebSocket] Connecting to:', wsUrl);
        this.websocket = new ws_1.default(wsUrl);
        return new Promise((resolve, reject) => {
            // Set a timeout for the connection
            const connectionTimeout = setTimeout(() => {
                console.error('[WebSocket] Connection timeout after 10 seconds');
                if (this.websocket) {
                    this.websocket.terminate();
                }
                reject(new Error('WebSocket connection timeout after 10 seconds'));
            }, 10000);
            this.websocket.on('error', (error) => {
                console.error('[WebSocket] Connection error:', error);
                clearTimeout(connectionTimeout);
                reject(error);
            });
            this.websocket.on('open', () => {
                console.log('[WebSocket] Connection opened successfully');
                clearTimeout(connectionTimeout);
                // Initialize the message manager with this websocket
                console.log('[WebSocket] Initializing message manager');
                messageManager_1.default.initialize(this.websocket);
                this.initialized = true;
                console.log('[WebSocket] WebSocket fully initialized and ready');
                resolve(this.websocket);
            });
            this.websocket.on('close', (code, reason) => {
                console.log(`[WebSocket] Connection closed with code: ${code}, reason: ${reason.toString()}`);
                clearTimeout(connectionTimeout);
                // Clean up pending requests when connection closes
                console.log('[WebSocket] Cleaning up message manager');
                messageManager_1.default.cleanup();
                this.initialized = false;
            });
            this.websocket.on('message', (data) => {
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
    get getWebsocket() {
        if (!this.websocket) {
            console.error('[WebSocket] WebSocket is not initialized');
            throw new Error('WebSocket is not initialized');
        }
        if (this.websocket.readyState !== ws_1.default.OPEN) {
            console.error('[WebSocket] Attempted to access WebSocket but it is not open. Ready state:', this.websocket.readyState);
            throw new Error('WebSocket is not open');
        }
        console.log('[WebSocket] WebSocket access - ready state:', this.websocket.readyState);
        return this.websocket;
    }
    /**
     * Waits for the WebSocket to be ready and returns it.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance when it's ready.
     */
    async waitForWebSocket() {
        if (!this.websocket) {
            console.error('[WebSocket] WebSocket is not initialized');
            throw new Error('WebSocket is not initialized');
        }
        if (this.websocket.readyState === ws_1.default.OPEN) {
            console.log('[WebSocket] WebSocket is already open');
            return this.websocket;
        }
        console.log('[WebSocket] Waiting for WebSocket to connect...');
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.error('[WebSocket] Connection timeout after 5 seconds');
                reject(new Error('WebSocket connection timeout'));
            }, 5000);
            this.websocket.once('open', () => {
                console.log('[WebSocket] WebSocket connection established while waiting');
                clearTimeout(timeout);
                resolve(this.websocket);
            });
            this.websocket.once('error', (error) => {
                console.error('[WebSocket] WebSocket error while waiting:', error);
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
    /**
     * Get the message manager instance
     */
    get messageManager() {
        if (!this.initialized) {
            console.log('[WebSocket] Accessing message manager (not yet initialized)');
        }
        return messageManager_1.default;
    }
    /**
     * Check if the WebSocket is initialized and ready
     */
    get isInitialized() {
        return this.initialized && this.websocket && this.websocket.readyState === ws_1.default.OPEN;
    }
}
// console.log('[WebSocket] Creating cbws singleton instance');
exports.default = new cbws();
