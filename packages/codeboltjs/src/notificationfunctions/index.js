"use strict";
/**
 * Notification Functions Module
 *
 * This module provides wrapper functions for all notification types defined in the
 * src/types/notifications directory. It allows users to send various types of
 * notifications through the WebSocket connection to the Codebolt application.
 *
 * The notification system covers 15 different categories:
 * - agent: Subagent task operations and completions
 * - browser: Web fetch and search operations
 * - chat: User messages and agent responses
 * - codeutils: Search operations and results
 * - crawler: Web crawling and search operations
 * - dbmemory: Knowledge storage and retrieval operations
 * - fs: File and folder operations
 * - git: Version control operations
 * - history: Conversation summarization operations
 * - llm: Inference requests and token counting operations
 * - mcp: MCP server operations and tool executions
 * - search: Search initialization and query operations
 * - system: Agent initialization and completion states
 * - terminal: Command execution operations
 * - todo: Task operations and lifecycle
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationFunctions = exports.NotificationErrorCodes = exports.NotificationError = void 0;
// Export utilities for advanced usage
__exportStar(require("./utils"), exports);
// Export error types
var utils_1 = require("./utils");
Object.defineProperty(exports, "NotificationError", { enumerable: true, get: function () { return utils_1.NotificationError; } });
Object.defineProperty(exports, "NotificationErrorCodes", { enumerable: true, get: function () { return utils_1.NotificationErrorCodes; } });
// Export all notification functions and types
__exportStar(require("./agent"), exports);
__exportStar(require("./browser"), exports);
__exportStar(require("./chat"), exports);
__exportStar(require("./codeutils"), exports);
__exportStar(require("./crawler"), exports);
__exportStar(require("./dbmemory"), exports);
__exportStar(require("./fs"), exports);
__exportStar(require("./git"), exports);
__exportStar(require("./history"), exports);
__exportStar(require("./llm"), exports);
__exportStar(require("./mcp"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./system"), exports);
__exportStar(require("./terminal"), exports);
__exportStar(require("./todo"), exports);
// Import notification objects
const agent_1 = require("./agent");
const browser_1 = require("./browser");
const chat_1 = require("./chat");
const codeutils_1 = require("./codeutils");
const crawler_1 = require("./crawler");
const dbmemory_1 = require("./dbmemory");
const fs_1 = require("./fs");
const git_1 = require("./git");
const history_1 = require("./history");
const llm_1 = require("./llm");
const mcp_1 = require("./mcp");
const search_1 = require("./search");
const system_1 = require("./system");
const terminal_1 = require("./terminal");
const todo_1 = require("./todo");
/**
 * Complete notification functions object
 * This object contains all notification functions organized by category
 */
exports.notificationFunctions = {
    agent: agent_1.agentNotifications,
    browser: browser_1.browserNotifications,
    chat: chat_1.chatNotifications,
    codeutils: codeutils_1.codeutilsNotifications,
    crawler: crawler_1.crawlerNotifications,
    dbmemory: dbmemory_1.dbmemoryNotifications,
    fs: fs_1.fsNotifications,
    git: git_1.gitNotifications,
    history: history_1.historyNotifications,
    llm: llm_1.llmNotifications,
    mcp: mcp_1.mcpNotifications,
    search: search_1.searchNotifications,
    system: system_1.systemNotifications,
    terminal: terminal_1.terminalNotifications,
    todo: todo_1.todoNotifications
};
// Default export for the notification functions
exports.default = exports.notificationFunctions;
