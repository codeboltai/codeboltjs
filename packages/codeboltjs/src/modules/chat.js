"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// chat.ts
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
/**
 * Chat module to interact with the WebSocket server.
 */
const cbchat = {
    /**
     * Retrieves the chat history from the server.
     * @returns {Promise<ChatMessage[]>} A promise that resolves with an array of ChatMessage objects representing the chat history.
     */
    getChatHistory: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.ChatEventType.GET_CHAT_HISTORY
        }, enum_1.ChatResponseType.GET_CHAT_HISTORY_RESPONSE);
    },
    /**
     * Sets a global request handler for all incoming messages
     * @param handler The async handler function
     */
    setRequestHandler: (handler) => {
        const waitForConnection = () => {
            const setupHandler = () => {
                if (websocket_1.default.messageManager) {
                    websocket_1.default.messageManager.on('message', async (request) => {
                        try {
                            await handler(request, (responseData) => {
                                websocket_1.default.messageManager.send({
                                    type: enum_1.ChatEventType.PROCESS_STOPPED,
                                    ...responseData
                                });
                            });
                        }
                        catch (error) {
                            console.error('Error handling request:', error);
                        }
                    });
                }
                else {
                    setTimeout(setupHandler, 100);
                }
            };
            setupHandler();
        };
        waitForConnection();
    },
    /**
     * Sends a message through the WebSocket connection.
     * @param {string} message - The message to be sent.
     */
    sendMessage: (message, payload) => {
        websocket_1.default.messageManager.send({
            "type": enum_1.ChatEventType.SEND_MESSAGE,
            "message": message,
            payload
        });
    },
    /**
     * Waits for a reply to a sent message.
     * @param {string} message - The message for which a reply is expected.
     * @returns {Promise<UserMessage>} A promise that resolves with the reply.
     */
    waitforReply: (message) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.ChatEventType.WAIT_FOR_REPLY,
            "message": message
        }, enum_1.ChatResponseType.WAIT_FOR_MESSAGE_RESPONSE);
    },
    /**
     * Notifies the server that a process has started and sets up a listener for stopProcessClicked events.
     * @param {Function} onStopClicked - Callback function to handle stop process events.
     * @returns An object containing a stopProcess method.
     */
    processStarted: (onStopClicked) => {
        // Send the process started message
        websocket_1.default.messageManager.send({
            "type": enum_1.ChatEventType.PROCESS_STARTED
        });
        // Register event listener for WebSocket messages if callback provided
        if (onStopClicked) {
            const handleStopMessage = (message) => {
                if (message.type === enum_1.ChatEventType.STOP_PROCESS_CLICKED) {
                    onStopClicked(message);
                }
            };
            websocket_1.default.messageManager.on('message', handleStopMessage);
            // Return an object that includes the stopProcess method and cleanup
            return {
                stopProcess: () => {
                    websocket_1.default.messageManager.send({
                        "type": enum_1.ChatEventType.PROCESS_STOPPED
                    });
                },
                cleanup: () => {
                    websocket_1.default.messageManager.removeListener('message', handleStopMessage);
                }
            };
        }
        // Return an object that includes the stopProcess method
        return {
            stopProcess: () => {
                websocket_1.default.messageManager.send({
                    "type": enum_1.ChatEventType.PROCESS_STOPPED
                });
            }
        };
    },
    /**
     * Stops the ongoing process.
     * Sends a specific message to the server to stop the process.
     */
    stopProcess: () => {
        websocket_1.default.messageManager.send({
            "type": enum_1.ChatEventType.PROCESS_STOPPED
        });
    },
    /**
   * Stops the ongoing process.
   * Sends a specific message to the server to stop the process.
   */
    processFinished: () => {
        websocket_1.default.messageManager.send({
            "type": enum_1.ChatEventType.PROCESS_FINISHED
        });
    },
    /**
     * Sends a confirmation request to the server with two options: Yes or No.
     * @returns {Promise<string>} A promise that resolves with the server's response.
     */
    sendConfirmationRequest: (confirmationMessage, buttons = [], withFeedback = false) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.ChatEventType.CONFIRMATION_REQUEST,
            "message": confirmationMessage,
            buttons: buttons,
            withFeedback
        }, enum_1.ChatResponseType.CONFIRMATION_OR_FEEDBACK_RESPONSE);
    },
    askQuestion: (question, buttons = [], withFeedback = false) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.ChatEventType.CONFIRMATION_REQUEST,
            "message": question,
            buttons: buttons,
            withFeedback
        }, enum_1.ChatResponseType.CONFIRMATION_OR_FEEDBACK_RESPONSE);
    },
    /**
 * Sends a notification event to the server.
 * @param {string} notificationMessage - The message to be sent in the notification.
 */
    sendNotificationEvent: (notificationMessage, type) => {
        websocket_1.default.messageManager.send({
            "type": enum_1.ChatEventType.NOTIFICATION_EVENT,
            "message": notificationMessage,
            "eventType": type
        });
    },
};
exports.default = cbchat;
