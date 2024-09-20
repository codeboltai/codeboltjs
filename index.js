"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("./modules/websocket"));
const chat_1 = __importDefault(require("./modules/chat"));
class Codebolt {
    constructor() {
        this.websocket = null;
        this.wsManager = new websocket_1.default();
        this.chat = new chat_1.default(this.wsManager);
    }
    static getInstance() {
        if (!Codebolt.instance) {
            Codebolt.instance = new Codebolt();
        }
        return Codebolt.instance;
    }
    async connect() {
        await this.wsManager.connect();
    }
    async disconnect() {
        await this.wsManager.disconnect();
    }
}
Codebolt.instance = null;
exports.default = Codebolt.getInstance();
