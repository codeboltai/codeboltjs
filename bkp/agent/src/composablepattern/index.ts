/**
 * @fileoverview Composable Agent Pattern - Main exports
 * @description Provides a simple, composable API for creating and managing agents
 * 
 * @example
 * ```typescript
 * import { ComposableAgent, createTool, Memory, LibSQLStore, MDocument } from '@codebolt/agent/composable';
 * import { z } from 'zod';
 * 
 * // Create a weather tool
 * const weatherTool = createTool({
 *   id: 'get-weather',
 *   description: 'Get current weather for a location',
 *   inputSchema: z.object({
 *     location: z.string().describe('City name'),
 *   }),
 *   outputSchema: z.object({
 *     temperature: z.number(),
 *     feelsLike: z.number(),
 *     humidity: z.number(),
 *     windSpeed: z.number(),
 *     conditions: z.string(),
 *     location: z.string(),
 *   }),
 *   execute: async ({ context }) => {
 *     return await getWeather(context.location);
 *   },
 * });
 * 
 * // Create memory with LibSQL storage
 * const memory = new Memory({
 *   storage: new LibSQLStore({
 *     url: 'file:../mastra.db',
 *   }),
 * });
 * 
 * // Create agent
 * const codeboltagent = new ComposableAgent({
 *   name: 'Weather Agent',
 *   instructions: `
 *     You are a helpful weather assistant that provides accurate weather information.
 *     Use the weatherTool to fetch current weather data.
 *   `,
 *   model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
 *   tools: { weatherTool },
 *   memory,
 * });
 * 
 * // Execute a task
 * const result = await codeboltagent.execute('What is the weather in New York?');
 * console.log(result.message);
 * ```
 */

// Core agent
export { ComposableAgent, createAgent } from './agent';

// Tool system
export { 
  createTool, 
  toolToOpenAIFunction,
  toolsToOpenAIFunctions,
  executeTool,
  createDefaultTools,
  attemptCompletionTool,
  askFollowUpTool
} from './tool';

// Memory and storage
export { 
  Memory,
  createCodeBoltMemory,
  createCodeBoltAgentMemory,
  createCodeBoltProjectMemory,
  createCodeBoltDbMemory
} from './memory';

// CodeBolt Storage
export {
  CodeBoltAgentStore,
  CodeBoltMemoryStore,
  CodeBoltProjectStore,
  createCodeBoltStore,
  type CodeBoltStoreConfig
} from './codebolt-storage';

// Document handling
export { MDocument } from './document';

// Workflow system
export {
  Workflow,
  createWorkflow,
  createAgentStep,
  createTransformStep,
  createConditionalStep,
  createDelayStep,
  createStep,
  createSimpleStep,
  createAsyncStep,
  createValidationStep,
  createLoggingStep
} from './workflow';

// User Context Management
export {
  saveUserMessage,
  getUserMessage,
  getUserConfig,
  getMentionedMCPs,
  getMentionedFiles,
  getMentionedAgents,
  getRemixPrompt,
  getMessageText,
  getSimpleMessage,
  setSessionData,
  getSessionData,
  clearUserContext
} from './user-context';

// Types
export type {
  ComposableAgent as IComposableAgent,
  ComposableAgentConfig,
  Tool,
  ToolConfig,
  Message,
  MessageContent,
  ToolCall,
  ExecutionResult,
  ExecutionContext,
  StreamCallback,
  StreamChunk,
  MemoryConfig,
  StorageProvider,
  LibSQLStoreConfig,
  DocumentConfig,
  ProcessedDocument,
  CodeBoltMessage,
  AgentProcessingConfig
} from './types';

// Workflow types
export type {
  WorkflowContext,
  WorkflowStep,
  WorkflowStepResult,
  WorkflowConfig,
  WorkflowResult,
  AgentStepConfig,
  ConditionalStepConfig,
  ParallelStepConfig,
  LoopStepConfig
} from './workflow';

// Re-export zod for convenience
export { z } from 'zod';
