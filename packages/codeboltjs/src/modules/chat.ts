// chat.ts
import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import {
    ChatMessage,
    UserMessage,
    ChatRequest,
    ChatResponseData,
    SteeringMessage,
    StopProcessMessage,
    ProcessControl,
    ProcessControlWithCleanup
} from '@codebolt/types/sdk';
import { ChatEventType, ChatResponseType } from '@codebolt/types/enum';

// Re-export types for consumers
export type {
    ChatRequest,
    ChatResponseData,
    SteeringMessage,
    StopProcessMessage,
    ProcessControl,
    ProcessControlWithCleanup
};

type RequestHandler = (request: ChatRequest, response: (data: ChatResponseData) => void) => Promise<void> | void;

// Steering message state
const steeringMessageMap = new Map<string, SteeringMessage>();

// Subscribe to steering messages
const steeringSubscription = cbws.messageManager.subscribe('steeringMessage');
steeringSubscription.on('message', (message: SteeringMessage) => {
    const eventId = randomUUID();
    steeringMessageMap.set(eventId, message);
});
/**
 * Chat module to interact with the WebSocket server.
 */
const cbchat = {
    /**
     * Retrieves the chat history from the server.
     * @returns {Promise<ChatMessage[]>} A promise that resolves with an array of ChatMessage objects representing the chat history.
     */
    getChatHistory: (threadId: string): Promise<ChatMessage> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": ChatEventType.GET_CHAT_HISTORY,
                threadId
            },
            ChatResponseType.GET_CHAT_HISTORY_RESPONSE
        );
    },
    /**
     * Sets a global request handler for all incoming messages
     * @param handler The async handler function
     */
    setRequestHandler: (handler: RequestHandler): void => {
        const waitForConnection = (): void => {
            const setupHandler = (): void => {
                if (cbws.messageManager) {
                    cbws.messageManager.on('message', async (request: ChatRequest) => {
                        try {
                            await handler(request, (responseData: ChatResponseData) => {
                                cbws.messageManager.send({
                                    type: ChatEventType.PROCESS_STOPPED,
                                    ...responseData
                                });
                            });
                        } catch (error) {
                            console.error('Error handling request:', error);
                        }
                    });
                } else {
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
     * @param {object} payload - Optional additional payload data.
     */
    sendMessage: (message: string, payload?: object): void => {
        cbws.messageManager.send({
            "type": ChatEventType.SEND_MESSAGE,
            "message": message,
            payload
        });
    },
    /**
     * Waits for a reply to a sent message.
     * @param {string} message - The message for which a reply is expected.
     * @returns {Promise<UserMessage>} A promise that resolves with the reply.
     */
    waitforReply: (message: string): Promise<UserMessage> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": ChatEventType.WAIT_FOR_REPLY,
                "message": message
            },
            ChatResponseType.WAIT_FOR_MESSAGE_RESPONSE
        );
    },
    /**
     * Notifies the server that a process has started and sets up a listener for stopProcessClicked events.
     * @param {Function} onStopClicked - Callback function to handle stop process events.
     * @returns An object containing a stopProcess method.
     */
    processStarted: (onStopClicked?: (message: StopProcessMessage) => void): ProcessControl | ProcessControlWithCleanup => {
        // Send the process started message
        cbws.messageManager.send({
            "type": ChatEventType.PROCESS_STARTED
        });

        // Register event listener for WebSocket messages if callback provided
        if (onStopClicked) {
            const handleStopMessage = (message: StopProcessMessage): void => {
                if (message.type === ChatEventType.STOP_PROCESS_CLICKED) {
                    onStopClicked(message);
                }
            };

            cbws.messageManager.on('message', handleStopMessage);

            // Return an object that includes the stopProcess method and cleanup
            return {
                stopProcess: (): void => {
                    cbws.messageManager.send({
                        "type": ChatEventType.PROCESS_STOPPED
                    });
                },
                cleanup: (): void => {
                    cbws.messageManager.removeListener('message', handleStopMessage);
                }
            };
        }

        // Return an object that includes the stopProcess method
        return {
            stopProcess: (): void => {
                cbws.messageManager.send({
                    "type": ChatEventType.PROCESS_STOPPED
                });
            }
        };
    },
    /**
     * Stops the ongoing process.
     * Sends a specific message to the server to stop the process.
     */
    stopProcess: () => {
        cbws.messageManager.send({
            "type": ChatEventType.PROCESS_STOPPED
        });
    },
    /**
   * Stops the ongoing process.
   * Sends a specific message to the server to stop the process.
   */
    processFinished: () => {
        cbws.messageManager.send({
            "type": ChatEventType.PROCESS_FINISHED
        });
    },
    /**
     * Sends a confirmation request to the server with two options: Yes or No.
     * @returns {Promise<string>} A promise that resolves with the server's response.
     */
    sendConfirmationRequest: (confirmationMessage: string, buttons: string[] = [], withFeedback: boolean = false): Promise<string> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": ChatEventType.CONFIRMATION_REQUEST,
                "message": confirmationMessage,
                buttons: buttons,
                withFeedback
            },
            ChatResponseType.CONFIRMATION_OR_FEEDBACK_RESPONSE
        );
    },
    askQuestion: (question: string, buttons: string[] = [], withFeedback: boolean = false): Promise<string> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": ChatEventType.CONFIRMATION_REQUEST,
                "message": question,
                buttons: buttons,
                withFeedback
            },
            ChatResponseType.CONFIRMATION_OR_FEEDBACK_RESPONSE
        );
    },
    /**
 * Sends a notification event to the server.
 * @param {string} notificationMessage - The message to be sent in the notification.
 */
    sendNotificationEvent: (notificationMessage: string, type: 'debug' | 'git' | 'planner' | 'browser' | 'editor' | 'terminal' | 'preview'): void => {
        cbws.messageManager.send({
            "type": ChatEventType.NOTIFICATION_EVENT,
            "message": notificationMessage,
            "eventType": type
        });
    },

    /**
     * Checks if any steering message has been received.
     * @returns The message data if available, or null
     */
    checkForSteeringMessage: (): SteeringMessage | null => {
        if (steeringMessageMap.size > 0) {
            const entry = steeringMessageMap.entries().next().value;
            if (entry) {
                const [key, value] = entry;
                steeringMessageMap.delete(key);
                return value;
            }
        }
        return null;
    },

    /**
     * Waits for a steering message.
     * @returns A promise that resolves with the message data
     */
    onSteeringMessageReceived: async (): Promise<SteeringMessage | null> => {
        const message = cbchat.checkForSteeringMessage();
        if (message) return message;

        return new Promise((resolve) => {
            steeringSubscription.once('message', () => {
                const data = cbchat.checkForSteeringMessage();
                resolve(data);
            });
        });
    },

};

export default cbchat;
