"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSummary = exports.logType = void 0;
const websocket_1 = __importDefault(require("./websocket"));
/**
 * Enum representing different types of log messages.
 */
var logType;
(function (logType) {
    /** Informational messages */
    logType["info"] = "info";
    /** Error messages */
    logType["error"] = "error";
    /** Warning messages */
    logType["warning"] = "warning";
})(logType || (exports.logType = logType = {}));
/**
 * Object with methods for summarizing chat history.
 * Provides functionality to create summaries of conversation history.
 */
exports.chatSummary = {
    /**
     * Summarizes the entire chat history.
     *
     * @returns Promise with an array of message objects containing role and content
     */
    summarizeAll: () => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "chatSummaryEvent",
                "action": "summarizeAll",
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                const response = JSON.parse(data);
                if (response.type === "getSummarizeAllResponse") {
                    resolve(response.payload); // Resolve the Promise with the response data
                }
            });
        });
    },
    /**
     * Summarizes a specific part of the chat history.
     *
     * @param messages - Array of message objects to summarize
     * @param depth - How far back in history to consider
     * @returns Promise with an array of summarized message objects
     */
    summarize: (messages, depth) => {
        return new Promise((resolve, reject) => {
            websocket_1.default.getWebsocket.send(JSON.stringify({
                "type": "chatSummaryEvent",
                "action": "summarize",
                messages,
                depth
            }));
            websocket_1.default.getWebsocket.on('message', (data) => {
                const response = JSON.parse(data);
                if (response.type === "getSummarizeResponse") {
                    resolve(response.payload); // Resolve the Promise with the response data
                }
            });
        });
    }
};
exports.default = exports.chatSummary;
