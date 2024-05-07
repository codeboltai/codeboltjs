import cbws from './websocket';
import { EventEmitter } from 'events';

/**
 * CustomEventEmitter class that extends the Node.js EventEmitter class.
 */
export class CustomEventEmitter extends EventEmitter {}
/**
 * A module for executing commands in a terminal-like environment via WebSocket.
 */
const cbterminal = {
    eventEmitter: new CustomEventEmitter(),

    /**
     * Executes a given command and returns the result.
     * Listens for messages from the WebSocket that indicate the output, error, or finish state
     * of the executed command and resolves the promise accordingly.
     *
     * @param {string} command - The command to be executed.
     * @returns {Promise<any>} A promise that resolves with the command's output, error, or finish signal.
     */
    executeCommand: async (command: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "executeCommand",
                "message": command,
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "commandOutput" || response.type === "commandError" || response.type === "commandFinish") {
                    resolve(response);
                }
            });
        });
    },

    /**
     * Executes a given command and keeps running until an error occurs.
     * Listens for messages from the WebSocket and resolves the promise when an error is encountered.
     *
     * @param {string} command - The command to be executed.
     * @returns {Promise<any>} A promise that resolves when an error occurs during command execution.
     */
    executeCommandRunUntilError: async (command: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "executeCommandRunUntilError",
                "message": command,
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if ( response.type === "commandError") {
                    resolve(response);
                }
            });
        });
    },

  
    /**
     * Sends a manual interrupt signal to the terminal.
     *
     * @returns {void}
     */
    sendManualInterrupt(): Promise<any>  {
       
        return new Promise((resolve, reject) => {
           cbws.getWebsocket.send(JSON.stringify({
            "type": "sendInterruptToTerminal"
        }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "terminalInterrupted") {
                    resolve(response);
                }
            });
        });
    },

    /**
     * Executes a given command and streams the output.
     * Listens for messages from the WebSocket and streams the output data.
     *
     * @param {string} command - The command to be executed.
     * @returns {Promise<any>} A promise that streams the output data during command execution.
     */
    executeCommandWithStream(command: string) {
         // Send the process started message
         cbws.getWebsocket.send(JSON.stringify({
            "type": "executeCommandWithStream",
            "message": command,
        }));
        // Register event listener for WebSocket messages
        cbws.getWebsocket.on('message', (data: string) => {
            const response = JSON.parse(data);
            console.log("Received message:", response);
            if (response.type === "commandOutput" || response.type === "commandError" || response.type === "commandFinish") 
            // Emit a custom event based on the message type
            this.eventEmitter.emit("serverEvents", response.response);
        });

        // Return an object that includes the event emitter and the stopProcess method
        return this.eventEmitter
    
    }
   

 
};
export default cbterminal;