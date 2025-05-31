// chat.ts
import cbws from './websocket';
import { ChatMessage, UserMessage } from '@codebolt/types'

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
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "getChatHistory"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getChatHistoryResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            })
        })
    },
    /**
     * Sets a global request handler for all incoming messages
     * @param handler The async handler function
     */
    setRequestHandler: (handler: RequestHandler) => {
        const waitForConnection = () => {
            const setupHandler = () => {
                if (cbws.getWebsocket) {
                    cbws.getWebsocket.on('message', async (data: string) => {
                        try {
                            const request = JSON.parse(data);
                            await handler(request, (responseData: any) => {
                                cbws.getWebsocket.send(JSON.stringify({
                                    type: `processStoped`,
                                    ...responseData
                                }));
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
        cbws.getWebsocket.send(JSON.stringify({
            "type": "sendMessage",
            "message": message,
            payload
        }));
    },
    /**
     * Waits for a reply to a sent message.
     * @param {string} message - The message for which a reply is expected.
     * @returns {Promise<UserMessage>} A promise that resolves with the reply.
     */
    waitforReply: (message: string): Promise<UserMessage> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "waitforReply",
                "message": message
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "waitFormessageResponse") {
                    resolve(response); // Resolve the Promise with the response data
                }
            });
        });
    },
    /**
     * Notifies the server that a process has started and sets up a listener for stopProcessClicked events.
     * @param {Function} onStopClicked - Callback function to handle stop process events.
     * @returns An object containing a stopProcess method.
     */
    processStarted: (onStopClicked?: (message: any) => void) => {
        // Send the process started message
        cbws.getWebsocket.send(JSON.stringify({
            "type": "processStarted"
        }));
        
        // Register event listener for WebSocket messages if callback provided
        if (onStopClicked) {
            cbws.getWebsocket.on('message', (data: string) => {
                const message = JSON.parse(data);
                if (message.type === 'stopProcessClicked') {
                    onStopClicked(message);
                }
            });
        }

        // Return an object that includes the stopProcess method
        return {
            stopProcess: () => {
                // Implement the logic to stop the process here
                // For example, you might want to send a specific message to the server to stop the process
                cbws.getWebsocket.send(JSON.stringify({
                    "type": "processStoped"
                }));
            }
        };
    },
    /**
     * Stops the ongoing process.
     * Sends a specific message to the server to stop the process.
     */
    stopProcess: () => {
        // Implement the logic to stop the process here
        // For example, you might want to send a specific message to the server to stop the process
        cbws.getWebsocket.send(JSON.stringify({
            "type": "processStoped"
        }));
    },
    /**
   * Stops the ongoing process.
   * Sends a specific message to the server to stop the process.
   */
    processFinished: () => {
        // Implement the logic to stop the process here
        // For example, you might want to send a specific message to the server to stop the process
        cbws.getWebsocket.send(JSON.stringify({
            "type": "processFinished"
        }));
    },
    /**
     * Sends a confirmation request to the server with two options: Yes or No.
     * @returns {Promise<string>} A promise that resolves with the server's response.
     */
    sendConfirmationRequest: (confirmationMessage: string, buttons: string[] = [], withFeedback: boolean = false): Promise<string> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "confirmationRequest",
                "message": confirmationMessage,
                buttons: buttons,
                withFeedback

            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "confirmationResponse" || response.type === "feedbackResponse") {
                    resolve(response); // Resolve the Promise with the server's response
                }
            });
        });
    },
    askQuestion: (question: string, buttons: string[] = [], withFeedback: boolean = false): Promise<string> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "confirmationRequest",
                "message": question,
                buttons: buttons,
                withFeedback

            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "confirmationResponse" || response.type === "feedbackResponse") {
                    resolve(response); // Resolve the Promise with the server's response
                }
            });
        });
    },
    /**
 * Sends a notification event to the server.
 * @param {string} notificationMessage - The message to be sent in the notification.
 */
    sendNotificationEvent: (notificationMessage: string, type: 'debug' | 'git' | 'planner' | 'browser' | 'editor' | 'terminal' | 'preview'): void => {
        cbws.getWebsocket.send(JSON.stringify({
            "type": "notificationEvent",
            "message": notificationMessage,
            "eventType": type
        }));
    },

};

export default cbchat;
