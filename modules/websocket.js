"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
/**
 * Class representing a WebSocket connection.
 */
class CbWS {
    constructor() {
        this.websocket = null;
    }
    /**
     * Constructs a new cbws instance and initializes the WebSocket connection.
     */
    async connect() {
        if (this.websocket && this.websocket.readyState === ws_1.default.OPEN) {
            return this.websocket;
        }
        const uniqueConnectionId = this.getUniqueConnectionId();
        const initialMessage = this.getInitialMessage();
        this.websocket = new ws_1.default(`ws://localhost:12345/codebolt?id=${uniqueConnectionId}`);
        return await this.initializeWebSocket(initialMessage);
    }
    async disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }
    getUniqueConnectionId() {
        try {
            let fileContents = fs_1.default.readFileSync('./codeboltagent.yaml', 'utf8');
            let data = js_yaml_1.default.load(fileContents);
            return data.unique_connectionid;
        }
        catch (e) {
            console.error('Unable to locate codeboltagent.yaml file.');
            return '';
        }
    }
    getInitialMessage() {
        try {
            let fileContents = fs_1.default.readFileSync('./codeboltagent.yaml', 'utf8');
            let data = js_yaml_1.default.load(fileContents);
            return data.initial_message;
        }
        catch (e) {
            console.error('Unable to locate codeboltagent.yaml file.');
            return '';
        }
    }
    /**
     * Initializes the WebSocket by setting up event listeners and returning a promise that resolves
     * when the WebSocket connection is successfully opened.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance.
     */
    async initializeWebSocket(initialMessage) {
        return new Promise((resolve, reject) => {
            if (!this.websocket) {
                reject(new Error('WebSocket is not initialized'));
                return;
            }
            this.websocket.on('error', (error) => {
                console.log('WebSocket error:', error);
                reject(error);
            });
            this.websocket.on('open', () => {
                console.log('WebSocket connected');
                resolve(this.websocket);
            });
            this.websocket.on('message', (data) => {
                // Handle incoming WebSocket messages here.
                // console.log('WebSocket message received:', data);
            });
        });
    }
    /**
     * Getter for the WebSocket instance. Throws an error if the WebSocket is not open.
     * @returns {WebSocket} The WebSocket instance.
     * @throws {Error} If the WebSocket is not open.
     */
    getWebsocket() {
        if (!this.websocket || this.websocket.readyState !== ws_1.default.OPEN) {
            throw new Error('WebSocket is not open');
        }
        return this.websocket;
    }
    send(data) {
        if (!this.websocket || this.websocket.readyState !== ws_1.default.OPEN) {
            console.error('WebSocket is not open. Unable to send data.');
            return;
        }
        this.websocket.send(JSON.stringify(data));
    }
    on(callback) {
        if (!this.websocket) {
            console.error('WebSocket is not initialized. Unable to set up message listener.');
            return;
        }
        this.websocket.on('message', callback);
    }
}
exports.default = CbWS;
