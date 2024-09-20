"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("./modules/websocket"));
const chat_1 = __importDefault(require("./modules/chat"));
// import {chatSummary} from './modules/history'
/**
 * @class Codebolt
 * @description This class provides a unified interface to interact with various modules.
 */
class Codebolt {
    /**
     * @constructor
     * @description Initializes the websocket connection.
     */
    constructor() {
        this.wsManager = new websocket_1.default();
        this.chat = new chat_1.default(this.wsManager);
        // this.websocket = cbws.getWebsocket;
        // ... initialize other modules ...
    }
    static getInstance() {
        if (!Codebolt.instance) {
            Codebolt.instance = new Codebolt();
        }
        return Codebolt.instance;
    }
    /**
     * @method waitForConnection
     * @description Waits for the WebSocket connection to open.
     * @returns {Promise<void>} A promise that resolves when the WebSocket connection is open.
     */
    // async waitForConnection() {
    //     return new Promise<void>((resolve, reject) => {
    //         if (!this.websocket) {
    //             reject(new Error('WebSocket is not initialized'));
    //             return;
    //         }
    //         if (this.websocket.readyState === WebSocket.OPEN) {
    //             resolve();
    //             return;
    //         }
    //         this.websocket.addEventListener('open', () => {
    //             resolve();
    //         });
    //         this.websocket.addEventListener('error', (error) => {
    //             reject(error);
    //         });
    //     });
    // }
    async connect() {
        var _a;
        await ((_a = this.wsManager) === null || _a === void 0 ? void 0 : _a.connect());
    }
    async disconnect() {
        var _a;
        await ((_a = this.wsManager) === null || _a === void 0 ? void 0 : _a.disconnect());
        this.wsManager = null;
    }
}
Codebolt.instance = null;
exports.default = Codebolt.getInstance();
// module.exports = new Codebolt();
