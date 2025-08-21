import WebSocket from 'ws';
import { EventEmitter } from 'events';
import type { PendingRequest } from '../types/commonTypes';
/**
 * Centralized message manager for handling WebSocket communications
 */
export declare class MessageManager extends EventEmitter {
    pendingRequests: Map<string, PendingRequest>;
    websocket: WebSocket | null;
    /**
     * Initialize the message manager with a WebSocket instance
     */
    initialize(websocket: WebSocket): void;
    /**
     * Setup the centralized message listener
     */
    setupMessageListener(): void;
    /**
     * Handle incoming messages and resolve pending requests
     */
    handleMessage(response: any): void;
    /**
     * Send a message and wait for a specific response type
     * @param message The message to send
     * @param expectedResponseType The type of response to wait for
     * @param timeout Optional timeout in milliseconds. If not provided or set to 0, will wait indefinitely
     */
    sendAndWaitForResponse<T = any>(message: any, expectedResponseType: string, timeout?: number): Promise<T>;
    /**
     * Send a message without waiting for response
     */
    send(message: any): void;
    /**
     * Get the WebSocket instance
     */
    getWebSocket(): WebSocket | null;
    /**
     * Clean up all pending requests
     */
    cleanup(): void;
}
declare const _default: MessageManager;
export default _default;
