import CbWS from './modules/websocket';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import Chat from './modules/chat';

class Codebolt  { // Extend EventEmitter
    private static instance: Codebolt | null = null;
    private wsManager: CbWS;
    chat: Chat;

    constructor() {
        this.wsManager = new CbWS();
        this.chat = new Chat(this.wsManager);
    }
    
    public static getInstance(): Codebolt {
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

    websocket: WebSocket | null = null;
}

export default Codebolt.getInstance();