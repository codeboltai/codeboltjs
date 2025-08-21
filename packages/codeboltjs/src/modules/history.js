"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSummary = exports.LogType = exports.logType = void 0;
const websocket_1 = __importDefault(require("../core/websocket"));
const commonTypes_1 = require("../types/commonTypes");
Object.defineProperty(exports, "LogType", { enumerable: true, get: function () { return commonTypes_1.LogType; } });
const enum_1 = require("@codebolt/types/enum");
/**
 * Enum representing different types of log messages.
 * @deprecated Use LogType from commonTypes instead
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
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CHAT_SUMMARY_EVENT,
            "action": enum_1.ChatSummaryAction.SUMMARIZE_ALL,
        }, enum_1.ChatSummaryResponseType.SUMMARIZE_ALL_RESPONSE);
    },
    /**
     * Summarizes a specific part of the chat history.
     *
     * @param messages - Array of message objects to summarize
     * @param depth - How far back in history to consider
     * @returns Promise with an array of summarized message objects
     */
    summarize: (messages, depth) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.CHAT_SUMMARY_EVENT,
            "action": enum_1.ChatSummaryAction.SUMMARIZE_PART,
            messages,
            depth
        }, enum_1.ChatSummaryResponseType.SUMMARIZE_PART_RESPONSE);
    }
};
exports.default = exports.chatSummary;
