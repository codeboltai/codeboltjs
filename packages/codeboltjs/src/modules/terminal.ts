import cbws from '../core/websocket';
import { EventEmitter } from 'events';
import { CommandError, CommandFinish, CommandOutput, TerminalInterruptResponse, TerminalInterrupted } from '@codebolt/types/sdk';

import { TerminalEventType, TerminalResponseType } from '@codebolt/types/enum';
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
                "type": TerminalEventType.EXECUTE_COMMAND,
                "message": command,
                returnEmptyStringOnSuccess
            },
            TerminalResponseType.COMMAND_ERROR_OR_FINISH
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
                "type": TerminalEventType.EXECUTE_COMMAND_RUN_UNTIL_ERROR,
                "message": command,
                executeInMain
            },
            TerminalResponseType.COMMAND_ERROR
        );
    },

    /**
     * Executes a given command and keeps running until manually interrupted.
     * Listens for messages from the WebSocket and resolves the promise when interrupted.
     *
     * @param {string} command - The command to be executed.
     * @param {boolean} executeInMain - Whether to execute in main terminal.
     * @returns {Promise<CommandError>} A promise that resolves when the command is interrupted.
     */
    executeCommandRunUntilInterrupt: async (command: string,executeInMain=false): Promise<CommandError> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": TerminalEventType.EXECUTE_COMMAND_RUN_UNTIL_INTERRUPT,
                "message": command,
                executeInMain
            },
            TerminalResponseType.COMMAND_ERROR
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
                "type": TerminalEventType.SEND_INTERRUPT_TO_TERMINAL,
            },
            TerminalResponseType.TERMINAL_INTERRUPTED
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
            "type": TerminalEventType.EXECUTE_COMMAND_WITH_STREAM,
            "message": command,
            executeInMain
        });
        
        // Listen for streaming messages through the message manager
        const handleStreamMessage = (response: any) => {
            if (response.type === TerminalResponseType.COMMAND_OUTPUT || response.type === TerminalResponseType.COMMAND_ERROR || response.type === TerminalResponseType.COMMAND_FINISH) {
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
        
        forwardEvent(TerminalResponseType.COMMAND_OUTPUT);
        forwardEvent(TerminalResponseType.COMMAND_ERROR);
        forwardEvent(TerminalResponseType.COMMAND_FINISH);
        
        // Add a cleanup method to remove the listener
        streamEmitter.cleanup = () => {
            cbws.messageManager.removeListener('message', handleStreamMessage);
        };

        return streamEmitter;
    }
};

export default cbterminal;