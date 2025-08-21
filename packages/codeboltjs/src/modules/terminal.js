"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const events_1 = require("events");
const enum_1 = require("@codebolt/types/enum");
/**
 * CustomEventEmitter class that extends the Node.js EventEmitter class.
 */
class CustomEventEmitter extends events_1.EventEmitter {
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
    executeCommand: async (command, returnEmptyStringOnSuccess = false) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.TerminalEventType.EXECUTE_COMMAND,
            "message": command,
            returnEmptyStringOnSuccess
        }, enum_1.TerminalResponseType.COMMAND_ERROR_OR_FINISH);
    },
    /**
     * Executes a given command and keeps running until an error occurs.
     * Listens for messages from the WebSocket and resolves the promise when an error is encountered.
     *
     * @param {string} command - The command to be executed.
     * @returns {Promise<CommandError>} A promise that resolves when an error occurs during command execution.
     */
    executeCommandRunUntilError: async (command, executeInMain = false) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.TerminalEventType.EXECUTE_COMMAND_RUN_UNTIL_ERROR,
            "message": command,
            executeInMain
        }, enum_1.TerminalResponseType.COMMAND_ERROR);
    },
    /**
     * Sends a manual interrupt signal to the terminal.
     *
     * @returns {Promise<TerminalInterruptResponse>}
     */
    sendManualInterrupt() {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.TerminalEventType.SEND_INTERRUPT_TO_TERMINAL,
        }, enum_1.TerminalResponseType.TERMINAL_INTERRUPTED);
    },
    /**
     * Executes a given command and streams the output.
     * Listens for messages from the WebSocket and streams the output data.
     *
     * @param {string} command - The command to be executed.
     * @returns {EventEmitter} A promise that streams the output data during command execution.
     */
    executeCommandWithStream(command, executeInMain = false) {
        // Send the process started message
        websocket_1.default.messageManager.send({
            "type": enum_1.TerminalEventType.EXECUTE_COMMAND_WITH_STREAM,
            "message": command,
            executeInMain
        });
        // Listen for streaming messages through the message manager
        const handleStreamMessage = (response) => {
            if (response.type === enum_1.TerminalResponseType.COMMAND_OUTPUT || response.type === enum_1.TerminalResponseType.COMMAND_ERROR || response.type === enum_1.TerminalResponseType.COMMAND_FINISH) {
                this.eventEmitter.emit(response.type, response);
            }
        };
        websocket_1.default.messageManager.on('message', handleStreamMessage);
        // Create a new event emitter instance for this stream
        const streamEmitter = new CustomEventEmitter();
        // Forward events from the main emitter to the stream emitter
        const forwardEvent = (eventType) => {
            this.eventEmitter.on(eventType, (data) => {
                streamEmitter.emit(eventType, data);
            });
        };
        forwardEvent(enum_1.TerminalResponseType.COMMAND_OUTPUT);
        forwardEvent(enum_1.TerminalResponseType.COMMAND_ERROR);
        forwardEvent(enum_1.TerminalResponseType.COMMAND_FINISH);
        // Add a cleanup method to remove the listener
        streamEmitter.cleanup = () => {
            websocket_1.default.messageManager.removeListener('message', handleStreamMessage);
        };
        return streamEmitter;
    }
};
exports.default = cbterminal;
