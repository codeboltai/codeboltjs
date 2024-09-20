import WebSocket from 'ws';
import Chat from './modules/chat';
declare class Codebolt {
    private static instance;
    private wsManager;
    chat: Chat;
    constructor();
    static getInstance(): Codebolt;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    websocket: WebSocket | null;
}
declare const _default: Codebolt;
export default _default;
