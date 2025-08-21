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
export * from './utils';
export { NotificationError, NotificationErrorCodes } from './utils';
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
export declare const notificationFunctions: NotificationFunctions;
export default notificationFunctions;
