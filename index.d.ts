/**
 * @class Codebolt
 * @description This class provides a unified interface to interact with various modules.
 */
declare class Codebolt {
    private static instance;
    private wsManager;
    private chat;
    /**
     * @constructor
     * @description Initializes the websocket connection.
     */
    constructor();
    static getInstance(): Codebolt;
    /**
     * @method waitForConnection
     * @description Waits for the WebSocket connection to open.
     * @returns {Promise<void>} A promise that resolves when the WebSocket connection is open.
     */
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
declare const _default: Codebolt;
export default _default;
