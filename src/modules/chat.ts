// chat.ts
import cbws from './websocket';
import { EventEmitter } from 'events';

/**
 * CustomEventEmitter class that extends the Node.js EventEmitter class.
 */
class CustomEventEmitter extends EventEmitter {}

/**
 * Chat module to interact with the WebSocket server.
 */
const cbchat = {
    eventEmitter: new CustomEventEmitter(),

    /**
     * Sends a message through the WebSocket connection.
     * @param {string} message - The message to be sent.
     */
    sendMessage(message: string) {
        console.log(message);
        cbws.getWebsocket.send(JSON.stringify({
            "type": "sendMessage",
            "message": message
        }));
    },

    /**
     * Waits for a reply to a sent message.
     * @param {string} message - The message for which a reply is expected.
     * @returns {Promise<any>} A promise that resolves with the reply.
     */
    waitforReply(message: string): Promise<any> {
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
    processStarted() {
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
            this.eventEmitter.emit("stopProcessClicked", message);
        });

        // Return an object that includes the event emitter and the stopProcess method
        return {
            event: this.eventEmitter,
            stopProcess: () => {
                // Implement the logic to stop the process here
                console.log("Stopping process...");
                // For example, you might want to send a specific message to the server to stop the process
                cbws.getWebsocket.send(JSON.stringify({
                    "type": "processStoped"
                }));
            }
        };
    }
};

export default cbchat;