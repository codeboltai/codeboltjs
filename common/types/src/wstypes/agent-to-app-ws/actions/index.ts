/**
 * Agent-to-App Communication Schemas
 * 
 * This module contains all the schemas for messages sent from agents to the application
 * via WebSocket. These schemas are based on the modules in codeboltjs/src/modules/
 */

// Namespace exports to avoid naming conflicts
export * as FsEvents from './fsEventSchemas';
export * as GitEvents from './gitEventSchemas';
export * as BrowserEvents from './browserEventSchemas';
export * as TerminalEvents from './terminalEventSchemas';
export * as LlmEvents from './llmEventSchemas';
export * as TaskEvents from './taskEventSchemas';
export * as VectorDbEvents from './vectordbEventSchemas';
export * as MemoryEvents from './memoryEventSchemas';
export * as DebugEvents from './debugEventSchemas';
export * as CrawlerEvents from './crawlerEventSchemas';
export * as ProjectEvents from './projectEventSchemas';
export * as ChatEvents from './chatEventSchemas';
export * as StateEvents from './stateEventSchemas';
export * as McpEvents from './mcpEventSchemas';
export * as AgentEvents from './agentEventSchemas';
export * as TokenizerEvents from './tokenizerEventSchemas';
export * as HistoryEvents from './historyEventSchemas';
export * as UtilsEvents from './utilsEventSchemas';
export * as CodeUtilsEvents from './codeUtilsEventSchemas';



// Union of all agent-to-app event schemas
import { z } from 'zod';
import { fsEventSchema } from './fsEventSchemas';
import { gitEventSchema } from './gitEventSchemas';
import { browserEventSchema } from './browserEventSchemas';
import { terminalEventSchema } from './terminalEventSchemas';
import { llmEventSchema } from './llmEventSchemas';
import { taskEventSchema } from './taskEventSchemas';
import { vectordbEventSchema } from './vectordbEventSchemas';
import { memoryEventSchema } from './memoryEventSchemas';
import { debugEventSchema } from './debugEventSchemas';
import { crawlerEventSchema } from './crawlerEventSchemas';
import { projectEventSchema } from './projectEventSchemas';
import { chatEventSchema } from './chatEventSchemas';
import { stateEventSchema } from './stateEventSchemas';
import { mcpEventSchema } from './mcpEventSchemas';
import { agentEventSchema } from './agentEventSchemas';
import { tokenizerEventSchema } from './tokenizerEventSchemas';
import { historyEventSchema } from './historyEventSchemas';
import { utilsEventSchema } from './utilsEventSchemas';
import { codeUtilsEventSchema } from './codeUtilsEventSchemas';


// Master union of all agent-to-app events
export const agentToAppEventSchema = z.union([
  fsEventSchema,
  gitEventSchema,
  browserEventSchema,
  terminalEventSchema,
  llmEventSchema,
  taskEventSchema,
  vectordbEventSchema,
  memoryEventSchema,
  debugEventSchema,
  crawlerEventSchema,
  projectEventSchema,
  chatEventSchema,
  stateEventSchema,
  mcpEventSchema,
  agentEventSchema,
  tokenizerEventSchema,
  historyEventSchema,
  utilsEventSchema,
  codeUtilsEventSchema
]);

// Inferred type for all agent-to-app events
export type AgentToAppEvent = z.infer<typeof agentToAppEventSchema>; 