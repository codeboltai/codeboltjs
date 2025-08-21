import { ChatMessage, UserMessage } from '@codebolt/types/sdk';
type RequestHandler = (request: any, response: (data: any) => void) => Promise<void> | void;
/**
 * Chat module to interact with the WebSocket server.
 */
declare const cbchat: {
    /**
     * Retrieves the chat history from the server.
     * @returns {Promise<ChatMessage[]>} A promise that resolves with an array of ChatMessage objects representing the chat history.
     */
    getChatHistory: () => Promise<ChatMessage[]>;
    /**
     * Sets a global request handler for all incoming messages
     * @param handler The async handler function
     */
    setRequestHandler: (handler: RequestHandler) => void;
    /**
     * Sends a message through the WebSocket connection.
     * @param {string} message - The message to be sent.
     */
    sendMessage: (message: string, payload: any) => void;
    /**
     * Waits for a reply to a sent message.
     * @param {string} message - The message for which a reply is expected.
     * @returns {Promise<UserMessage>} A promise that resolves with the reply.
     */
    waitforReply: (message: string) => Promise<UserMessage>;
    /**
     * Notifies the server that a process has started and sets up a listener for stopProcessClicked events.
     * @param {Function} onStopClicked - Callback function to handle stop process events.
     * @returns An object containing a stopProcess method.
     */
    processStarted: (onStopClicked?: (message: any) => void) => {
        stopProcess: () => void;
        cleanup: () => void;
    } | {
        stopProcess: () => void;
        cleanup?: undefined;
    };
    /**
     * Stops the ongoing process.
     * Sends a specific message to the server to stop the process.
     */
    stopProcess: () => void;
    /**
   * Stops the ongoing process.
   * Sends a specific message to the server to stop the process.
   */
    processFinished: () => void;
    /**
     * Sends a confirmation request to the server with two options: Yes or No.
     * @returns {Promise<string>} A promise that resolves with the server's response.
     */
    sendConfirmationRequest: (confirmationMessage: string, buttons?: string[], withFeedback?: boolean) => Promise<string>;
    askQuestion: (question: string, buttons?: string[], withFeedback?: boolean) => Promise<string>;
    /**
 * Sends a notification event to the server.
 * @param {string} notificationMessage - The message to be sent in the notification.
 */
    sendNotificationEvent: (notificationMessage: string, type: "debug" | "git" | "planner" | "browser" | "editor" | "terminal" | "preview") => void;
};
export default cbchat;
