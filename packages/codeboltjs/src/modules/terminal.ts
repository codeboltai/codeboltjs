import cbws from '../core/websocket';
import { EventEmitter } from 'events';
import { CommandError, CommandFinish, CommandOutput, TerminalInterruptResponse, TerminalInterrupted } from '../types/socketMessageTypes';
/**
 * CustomEventEmitter class that extends the Node.js EventEmitter class.
 */
class CustomEventEmitter extends EventEmitter {
    cleanup?: () => void;
}
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
     * @returns {Promise<CommandOutput|CommandError>} A promise that resolves with the command's output, error, or finish signal.
     */
    executeCommand: async (command:string, returnEmptyStringOnSuccess:boolean = false) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "executeCommand",
                "message": command,
                returnEmptyStringOnSuccess
            },
            "commandError|commandFinish"
        );
    },

    /**
     * Executes a given command and keeps running until an error occurs.
     * Listens for messages from the WebSocket and resolves the promise when an error is encountered.
     *
     * @param {string} command - The command to be executed.
     * @returns {Promise<CommandError>} A promise that resolves when an error occurs during command execution.
     */
    executeCommandRunUntilError: async (command: string,executeInMain=false): Promise<CommandError> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "executeCommandRunUntilError",
                "message": command,
                executeInMain
            },
            "commandError"
        );
    },

  
    /**
     * Sends a manual interrupt signal to the terminal.
     *
     * @returns {Promise<TerminalInterruptResponse>} 
     */
    sendManualInterrupt(): Promise<TerminalInterruptResponse>  {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "sendInterruptToTerminal",
            },
            "terminalInterrupted"
        );
    },

    /**
     * Executes a given command and streams the output.
     * Listens for messages from the WebSocket and streams the output data.
     *
     * @param {string} command - The command to be executed.
     * @returns {EventEmitter} A promise that streams the output data during command execution.
     */
    executeCommandWithStream(command: string,executeInMain=false): CustomEventEmitter {
         // Send the process started message
         cbws.messageManager.send({
            "type": "executeCommandWithStream",
            "message": command,
            executeInMain
        });
        
        // Listen for streaming messages through the message manager
        const handleStreamMessage = (response: any) => {
            if (response.type === "commandOutput" || response.type === "commandError" || response.type === "commandFinish") {
                this.eventEmitter.emit(response.type, response);
            }
        };

        cbws.messageManager.on('message', handleStreamMessage);

        // Create a new event emitter instance for this stream
        const streamEmitter = new CustomEventEmitter();
        
        // Forward events from the main emitter to the stream emitter
        const forwardEvent = (eventType: string) => {
            this.eventEmitter.on(eventType, (data) => {
                streamEmitter.emit(eventType, data);
            });
        };
        
        forwardEvent('commandOutput');
        forwardEvent('commandError');
        forwardEvent('commandFinish');
        
        // Add a cleanup method to remove the listener
        streamEmitter.cleanup = () => {
            cbws.messageManager.removeListener('message', handleStreamMessage);
        };

        return streamEmitter;
    }
};

export default cbterminal;