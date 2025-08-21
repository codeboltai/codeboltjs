import WebSocket from 'ws';
import { MessageManager } from './messageManager';
/**
 * Class representing a WebSocket connection.
 */
declare class cbws {
    websocket: WebSocket;
    private initialized;
    /**
     * Constructs a new cbws instance and initializes the WebSocket connection.
     */
    constructor();
    private getUniqueConnectionId;
    private getInitialMessage;
    /**
     * Initializes the WebSocket by setting up event listeners and returning a promise that resolves
     * when the WebSocket connection is successfully opened.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance.
     */
    initializeWebSocket(): Promise<WebSocket>;
    /**
     * Getter for the WebSocket instance. Throws an error if the WebSocket is not open.
     * @returns {WebSocket} The WebSocket instance.
     * @throws {Error} If the WebSocket is not open.
     */
    get getWebsocket(): WebSocket;
    /**
     * Waits for the WebSocket to be ready and returns it.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance when it's ready.
     */
    waitForWebSocket(): Promise<WebSocket>;
    /**
     * Get the message manager instance
     */
    get messageManager(): MessageManager;
    /**
     * Check if the WebSocket is initialized and ready
     */
    get isInitialized(): boolean;
}
declare const _default: cbws;
export default _default;
