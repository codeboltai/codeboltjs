// chat.ts
import cbws from './websocket';
import { EventEmitter } from 'events';
import {ChatMessage} from  '@codebolt/types'



/**
 * CustomEventEmitter class that extends the Node.js EventEmitter class.
 */
class CustomEventEmitter extends EventEmitter {}
/**
 * Chat module to interact with the WebSocket server.
 */
const cbchat = {
    /**
     * @private
     */
    eventEmitter: new CustomEventEmitter(),
    
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
     * Sets up a listener for incoming WebSocket messages and emits a custom event when a message is received.
     * @returns {EventEmitter} The event emitter used for emitting custom events.
     */
    userMessageListener: () => {
        if (!cbws.getWebsocket) return;
        cbws.getWebsocket.on('message', (data: string) => {
            const response = JSON.parse(data);
            if (response.type === "messageResponse") {
                cbchat.eventEmitter.emit("userMessage", response.response);
            } 
        });
        return cbchat.eventEmitter;
    },

    /**
     * Sends a message through the WebSocket connection.
     * @param {string} message - The message to be sent.
     */
    sendMessage: (message: string) => {
        console.log(message);
        cbws.getWebsocket.send(JSON.stringify({
            "type": "sendMessage",
            "message": message
        }));
    },

    /**
     * Waits for a reply to a sent message.
     * @param {string} message - The message for which a reply is expected.
     * @returns {Promise<string>} A promise that resolves with the reply.
     */
    waitforReply: (message: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "waitforReply",
                "message": message
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "messageResponse") {
                    resolve(response); // Resolve the Promise with the response data
                } 
            });
        });
    },

    /**
     * Notifies the server that a process has started and sets up an event listener for stopProcessClicked events.
     * @returns An object containing the event emitter and a stopProcess method.
     */
    processStarted: () => {
        // Send the process started message
        cbws.getWebsocket.send(JSON.stringify({
            "type": "processStarted"
        }));
        // Register event listener for WebSocket messages
        cbws.getWebsocket.on('message', (data: string) => {
            const message = JSON.parse(data);
            console.log("Received message:", message);
            if(message.type==='stopProcessClicked')

            // Emit a custom event based on the message type
            cbchat.eventEmitter.emit("stopProcessClicked", message);
        });

        // Return an object that includes the event emitter and the stopProcess method
        return {
            event: cbchat.eventEmitter,
            stopProcess: () => {
                // Implement the logic to stop the process here
                console.log("Stopping process...");
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
        console.log("Stopping process...");
        // For example, you might want to send a specific message to the server to stop the process
        cbws.getWebsocket.send(JSON.stringify({
            "type": "processStoped"
        }));
    }
};

export default cbchat;
