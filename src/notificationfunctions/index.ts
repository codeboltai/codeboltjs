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

// Export utilities for advanced usage
export * from './utils';

// Export error types
export { NotificationError, NotificationErrorCodes } from './utils';

// Export all notification functions and types
export * from './agent';
export * from './browser';
export * from './chat';
export * from './codeutils';
export * from './crawler';
export * from './dbmemory';
export * from './fs';
export * from './git';
export * from './history';
export * from './llm';
export * from './mcp';
export * from './search';
export * from './system';
export * from './terminal';
export * from './todo';

// Import notification objects
import { agentNotifications } from './agent';
import { browserNotifications } from './browser';
import { chatNotifications } from './chat';
import { codeutilsNotifications } from './codeutils';
import { crawlerNotifications } from './crawler';
import { dbmemoryNotifications } from './dbmemory';
import { fsNotifications } from './fs';
import { gitNotifications } from './git';
import { historyNotifications } from './history';
import { llmNotifications } from './llm';
import { mcpNotifications } from './mcp';
import { searchNotifications } from './search';
import { systemNotifications } from './system';
import { terminalNotifications } from './terminal';
import { todoNotifications } from './todo';

// Import notification interfaces
import { type AgentNotifications } from '../types/notificationFunctions/agent';
import { type BrowserNotifications } from '../types/notificationFunctions/browser';
import { type ChatNotifications } from '../types/notificationFunctions/chat';
import { type CodeutilsNotifications } from '../types/notificationFunctions/codeutils';
import { type CrawlerNotifications } from '../types/notificationFunctions/crawler';
import { type DbmemoryNotifications } from '../types/notificationFunctions/dbmemory';
import { type FsNotifications } from '../types/notificationFunctions/fs';
import { type GitNotifications } from '../types/notificationFunctions/git';
import { type HistoryNotifications } from '../types/notificationFunctions/history';
import { type LlmNotifications } from '../types/notificationFunctions/llm';
import { type McpNotifications } from '../types/notificationFunctions/mcp';
import { type SearchNotifications } from '../types/notificationFunctions/search';
import { type SystemNotifications } from '../types/notificationFunctions/system';
import { type TerminalNotifications } from '../types/notificationFunctions/terminal';
import { type TodoNotifications } from '../types/notificationFunctions/todo';

// Main notification functions interface
export interface NotificationFunctions {
    agent: AgentNotifications;
    browser: BrowserNotifications;
    chat: ChatNotifications;
    codeutils: CodeutilsNotifications;
    crawler: CrawlerNotifications;
    dbmemory: DbmemoryNotifications;
    fs: FsNotifications;
    git: GitNotifications;
    history: HistoryNotifications;
    llm: LlmNotifications;
    mcp: McpNotifications;
    search: SearchNotifications;
    system: SystemNotifications;
    terminal: TerminalNotifications;
    todo: TodoNotifications;
}

/**
 * Complete notification functions object
 * This object contains all notification functions organized by category
 */
export const notificationFunctions: NotificationFunctions = {
    agent: agentNotifications,
    browser: browserNotifications,
    chat: chatNotifications,
    codeutils: codeutilsNotifications,
    crawler: crawlerNotifications,
    dbmemory: dbmemoryNotifications,
    fs: fsNotifications,
    git: gitNotifications,
    history: historyNotifications,
    llm: llmNotifications,
    mcp: mcpNotifications,
    search: searchNotifications,
    system: systemNotifications,
    terminal: terminalNotifications,
    todo: todoNotifications
};

// Default export for the notification functions
export default notificationFunctions;