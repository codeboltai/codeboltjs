import WebSocket from 'ws';
import { EventEmitter } from 'events';
import type { PendingRequest } from '../types/commonTypes';

/**
 * Centralized message manager for handling WebSocket communications
 */
export class MessageManager extends EventEmitter {
    public pendingRequests: Map<string, PendingRequest> = new Map();
    public websocket: WebSocket | null = null;
    public requestCounter = 0;

    /**
     * Initialize the message manager with a WebSocket instance
     */
    public initialize(websocket: WebSocket) {
        this.websocket = websocket;
        this.setupMessageListener();
    }

    /**
     * Setup the centralized message listener
     */
    public setupMessageListener() {
        if (!this.websocket) return;

        this.websocket.on('message', (data: WebSocket.Data) => {
            try {
                const response = JSON.parse(data.toString());
                this.handleMessage(response);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
    }

    /**
     * Handle incoming messages and resolve pending requests
     */
    public handleMessage(response: any) {
        const { type, requestId } = response;

        // Handle requests with specific requestId
        if (requestId && this.pendingRequests.has(requestId)) {
            const request = this.pendingRequests.get(requestId)!;
            this.pendingRequests.delete(requestId);
            request.resolve(response);
            return;
        }

        // Handle requests by message type
        for (const [id, request] of this.pendingRequests.entries()) {
            if (request.messageTypes.includes(type)) {
                this.pendingRequests.delete(id);
                request.resolve(response);
                return;
            }
        }

        // Emit the message for any other listeners (like onUserMessage)
        this.emit('message', response);
    }

    /**
     * Send a message and wait for a specific response type
     * @param message The message to send
     * @param expectedResponseType The type of response to wait for
     * @param timeout Optional timeout in milliseconds. If not provided or set to 0, will wait indefinitely
     */
    sendAndWaitForResponse<T = any>(
        message: any,
        expectedResponseType: string,
        timeout: number = 0
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.websocket) {
                reject(new Error('WebSocket is not initialized'));
                return;
            }

            const requestId = `req_${++this.requestCounter}_${Date.now()}`;
            
            // Add requestId to the message if it doesn't have one
            const messageWithId = { ...message, requestId };

            // Parse multiple message types separated by pipe
            const messageTypes = expectedResponseType.split('|').map(type => type.trim());
            console.log("Message types: ", messageTypes);

            // Store the pending request
            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                messageTypes,
                requestId
            });

            // Set timeout only if a positive timeout value is provided
            let timeoutId: ReturnType<typeof setTimeout> | undefined;
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    if (this.pendingRequests.has(requestId)) {
                        this.pendingRequests.delete(requestId);
                        reject(new Error(`Request timeout after ${timeout}ms for message types: ${expectedResponseType}`));
                    }
                }, timeout);

                // Override resolve to clear timeout
                const originalResolve = resolve;
                const wrappedResolve = (value: T) => {
                    clearTimeout(timeoutId);
                    originalResolve(value);
                };

                // Update the stored request with wrapped resolve
                const request = this.pendingRequests.get(requestId)!;
                request.resolve = wrappedResolve;
            }

            // Send the message
            this.websocket.send(JSON.stringify(messageWithId));
        });
    }

    /**
     * Send a message without waiting for response
     */
    send(message: any): void {
        if (!this.websocket) {
            throw new Error('WebSocket is not initialized');
        }
        this.websocket.send(JSON.stringify(message));
    }

    /**
     * Get the WebSocket instance
     */
    getWebSocket(): WebSocket | null {
        return this.websocket;
    }

    /**
     * Clean up all pending requests
     */
    cleanup(): void {
        for (const [id, request] of this.pendingRequests.entries()) {
            request.reject(new Error('WebSocket connection closed'));
        }
        this.pendingRequests.clear();
    }
}

export default new MessageManager(); 