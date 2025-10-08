/**
 * App-to-UI Communication Schemas
 * 
 * This module contains all the schemas for messages sent from the application server to the UI
 * via WebSocket. These schemas are based on the CLI services in src/main/server/cliLib/
 */

// Core message schemas
export * as CoreMessages from './coreMessageSchemas';

// MCP tool execution schemas
export * as McpToolMessages from './mcpToolMessageSchemas';

// File operation confirmation schemas
export * as FileMessages from './fileMessageSchemas';

// Notification schemas
export * as NotificationMessages from './notificationMessageSchemas';

// Agent communication schemas
export * as AgentMessages from './agentMessageSchemas';

// State update schemas
export * as StateMessages from './stateMessageSchemas';

// Response message schemas
export * as ResponseMessages from './responseMessageSchemas';

// Individual CLI service schemas
export * as TerminalService from './terminalServiceSchemas';
export * as VectordbService from './vectordbServiceSchemas';
export * as TaskService from './taskServiceSchemas';
export * as MessageService from './messageServiceSchemas';
export * as MemoryService from './memoryServiceSchemas';
export * as FsService from './fsServiceSchemas';
export * as BrowserService from './browserServiceSchemas';
export * as DebugService from './debugServiceSchemas';
export * as GitService from './gitServiceSchemas';
export * as TokenizerService from './tokenizerServiceSchemas';
export * as CodebaseSearchService from './codebaseSearchSchemas';
export * as CrawlerService from './crawlerServiceSchemas';
export * as ProblemMatcherService from './problemMatcherSchemas';
export * as ProjectService from './projectServiceSchemas';
export * as ChatHistoryService from './chatHistorySchemas';
export * as CodeUtilsService from './codeUtilsSchemas';
export * as JsTreeParserService from './jsTreeParserSchemas';
export * as AppService from './appServiceSchemas';
export * as StateService from './stateServiceSchemas';
export * as McpService from './mcpServiceSchemas';

// Union of all App-to-UI message schemas
import { z } from 'zod';
import { allCoreMessagesSchema } from './coreMessageSchemas';
import { mcpToolMessageSchema } from './mcpToolMessageSchemas';
import { fileMessageSchema } from './fileMessageSchemas';
import { notificationMessageSchema } from './notificationMessageSchemas';
import { agentMessageSchema } from './agentMessageSchemas';
import { stateMessageSchema } from './stateMessageSchemas';
import { responseMessageSchema } from './responseMessageSchemas';

// Import individual service schemas
import { terminalServiceSchema } from './terminalServiceSchemas';
import { vectordbServiceSchema } from './vectordbServiceSchemas';
import { taskServiceMessageSchema } from './taskServiceSchemas';
import { messageServiceSchema } from './messageServiceSchemas';
import { memoryServiceSchema } from './memoryServiceSchemas';
import { fsServiceMessageSchema } from './fsServiceSchemas';
import { browserServiceMessageSchema } from './browserServiceSchemas';
import { debugServiceSchema } from './debugServiceSchemas';
import { gitServiceMessageSchema } from './gitServiceSchemas';
import { tokenizerServiceMessageSchema } from './tokenizerServiceSchemas';
import { codebaseSearchServiceMessageSchema } from './codebaseSearchSchemas';
import { crawlerServiceMessageSchema } from './crawlerServiceSchemas';
import { problemMatcherServiceMessageSchema } from './problemMatcherSchemas';
import { projectServiceMessageSchema } from './projectServiceSchemas';
import { chatHistoryServiceMessageSchema } from './chatHistorySchemas';
import { codeUtilsServiceMessageSchema } from './codeUtilsSchemas';
import { jsTreeParserServiceMessageSchema } from './jsTreeParserSchemas';
import { appServiceMessageSchema } from './appServiceSchemas';
import { stateServiceMessageSchema } from './stateServiceSchemas';
import { mcpServiceSchema } from './mcpServiceSchemas';

// Master union of all App-to-UI messages
export const appToUiMessageSchema = z.union([
  allCoreMessagesSchema,
  mcpToolMessageSchema,
  fileMessageSchema,
  notificationMessageSchema,
  agentMessageSchema,
  stateMessageSchema,
  responseMessageSchema,
  // Individual CLI service messages
  terminalServiceSchema,
  vectordbServiceSchema,
  taskServiceMessageSchema,
  messageServiceSchema,
  memoryServiceSchema,
  fsServiceMessageSchema,
  browserServiceMessageSchema,
  debugServiceSchema,
  gitServiceMessageSchema,
  tokenizerServiceMessageSchema,
  codebaseSearchServiceMessageSchema,
  crawlerServiceMessageSchema,
  problemMatcherServiceMessageSchema,
  projectServiceMessageSchema,
  chatHistoryServiceMessageSchema,
  codeUtilsServiceMessageSchema,
  jsTreeParserServiceMessageSchema,
  appServiceMessageSchema,
  stateServiceMessageSchema,
  mcpServiceSchema,
]);

// Inferred type for all App-to-UI messages
export type AppToUiMessage = z.infer<typeof appToUiMessageSchema>; 