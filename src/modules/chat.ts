// chat.ts
import cbws from '../core/websocket';
import { ChatMessage, UserMessage } from '../types/cliWebSocketInterfaces';

type RequestHandler = (request: any, response: (data: any) => void) => Promise<void> | void;
/**
 * Chat module to interact with the WebSocket server.
 */
const cbchat = {
    /**
     * Retrieves the chat history from the server.
     * @returns {Promise<ChatMessage[]>} A promise that resolves with an array of ChatMessage objects representing the chat history.
     */
    getChatHistory: (): Promise<ChatMessage[]> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "getChatHistory"
            },
            "getChatHistoryResponse"
        );
    },
    /**
     * Sets a global request handler for all incoming messages
     * @param handler The async handler function
     */
    setRequestHandler: (handler: RequestHandler) => {
        const waitForConnection = () => {
            const setupHandler = () => {
                if (cbws.messageManager) {
                    cbws.messageManager.on('message', async (request: any) => {
                        try {
                            await handler(request, (responseData: any) => {
                                cbws.messageManager.send({
                                    type: `processStoped`,
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
        }
        waitForConnection();
    },

    /**
     * Sends a message through the WebSocket connection.
     * @param {string} message - The message to be sent.
     */
    sendMessage: (message: string, payload: any) => {
        cbws.messageManager.send({
            "type": "sendMessage",
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
                "type": "waitforReply",
                "message": message
            },
            "waitFormessageResponse"
        );
    },
    /**
     * Notifies the server that a process has started and sets up a listener for stopProcessClicked events.
     * @param {Function} onStopClicked - Callback function to handle stop process events.
     * @returns An object containing a stopProcess method.
     */
    processStarted: (onStopClicked?: (message: any) => void) => {
        // Send the process started message
        cbws.messageManager.send({
            "type": "processStarted"
        });
        
        // Register event listener for WebSocket messages if callback provided
        if (onStopClicked) {
            const handleStopMessage = (message: any) => {
                if (message.type === 'stopProcessClicked') {
                    onStopClicked(message);
                }
            };
            
            cbws.messageManager.on('message', handleStopMessage);
            
            // Return an object that includes the stopProcess method and cleanup
            return {
                stopProcess: () => {
                    cbws.messageManager.send({
                        "type": "processStoped"
                    });
                },
                cleanup: () => {
                    cbws.messageManager.removeListener('message', handleStopMessage);
                }
            };
        }

        // Return an object that includes the stopProcess method
        return {
            stopProcess: () => {
                cbws.messageManager.send({
                    "type": "processStoped"
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
            "type": "processStoped"
        });
    },
    /**
   * Stops the ongoing process.
   * Sends a specific message to the server to stop the process.
   */
    processFinished: () => {
        cbws.messageManager.send({
            "type": "processFinished"
        });
    },
    /**
     * Sends a confirmation request to the server with two options: Yes or No.
     * @returns {Promise<string>} A promise that resolves with the server's response.
     */
    sendConfirmationRequest: (confirmationMessage: string, buttons: string[] = [], withFeedback: boolean = false): Promise<string> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "confirmationRequest",
                "message": confirmationMessage,
                buttons: buttons,
                withFeedback
            },
            "confirmationResponse|feedbackResponse"
        );
    },
    askQuestion: (question: string, buttons: string[] = [], withFeedback: boolean = false): Promise<string> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "confirmationRequest",
                "message": question,
                buttons: buttons,
                withFeedback
            },
            "confirmationResponse|feedbackResponse"
        );
    },
    /**
 * Sends a notification event to the server.
 * @param {string} notificationMessage - The message to be sent in the notification.
 */
    sendNotificationEvent: (notificationMessage: string, type: 'debug' | 'git' | 'planner' | 'browser' | 'editor' | 'terminal' | 'preview'): void => {
        cbws.messageManager.send({
            "type": "notificationEvent",
            "message": notificationMessage,
            "eventType": type
        });
    },

};

export default cbchat;
