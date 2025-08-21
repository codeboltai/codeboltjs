"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageManager = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
/**
 * Centralized message manager for handling WebSocket communications
 */
class MessageManager extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.pendingRequests = new Map();
        this.websocket = null;
    }
    /**
     * Initialize the message manager with a WebSocket instance
     */
    initialize(websocket) {
        this.websocket = websocket;
        this.setupMessageListener();
    }
    /**
     * Setup the centralized message listener
     */
    setupMessageListener() {
        if (!this.websocket)
            return;
        this.websocket.on('message', (data) => {
            try {
                const response = JSON.parse(data.toString());
                this.handleMessage(response);
            }
            catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
    }
    /**
     * Handle incoming messages and resolve pending requests
     */
    handleMessage(response) {
        const { type, requestId } = response;
        // Handle requests with specific requestId
        if (requestId && this.pendingRequests.has(requestId)) {
            const request = this.pendingRequests.get(requestId);
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
    sendAndWaitForResponse(message, expectedResponseType, timeout = 0) {
        return new Promise((resolve, reject) => {
            if (!this.websocket) {
                reject(new Error('WebSocket is not initialized'));
                return;
            }
            const requestId = (0, uuid_1.v4)();
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
            let timeoutId;
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    if (this.pendingRequests.has(requestId)) {
                        this.pendingRequests.delete(requestId);
                        reject(new Error(`Request timeout after ${timeout}ms for message types: ${expectedResponseType}`));
                    }
                }, timeout);
                // Override resolve to clear timeout
                const originalResolve = resolve;
                const wrappedResolve = (value) => {
                    clearTimeout(timeoutId);
                    originalResolve(value);
                };
                // Update the stored request with wrapped resolve
                const request = this.pendingRequests.get(requestId);
                request.resolve = wrappedResolve;
            }
            // Send the message
            this.websocket.send(JSON.stringify(messageWithId));
        });
    }
    /**
     * Send a message without waiting for response
     */
    send(message) {
        const requestId = (0, uuid_1.v4)();
        message.requestId = requestId;
        if (!this.websocket) {
            throw new Error('WebSocket is not initialized');
        }
        this.websocket.send(JSON.stringify(message));
    }
    /**
     * Get the WebSocket instance
     */
    getWebSocket() {
        return this.websocket;
    }
    /**
     * Clean up all pending requests
     */
    cleanup() {
        for (const [id, request] of this.pendingRequests.entries()) {
            request.reject(new Error('WebSocket connection closed'));
        }
        this.pendingRequests.clear();
    }
}
exports.MessageManager = MessageManager;
exports.default = new MessageManager();
