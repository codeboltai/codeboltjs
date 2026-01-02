/**
 * Unified Agent Framework
 * 
 * This module provides a unified approach to agent development that combines:
 * - Message modification using the processor pattern
 * - Agent step execution with LLM integration
 * - Response execution with tool handling and conversation management
 * 
 * The framework is designed to be modular, extensible, and easy to use.
 */

// Core types and interfaces
export type {
    UnifiedAgentConfig,
    UnifiedMessageOutput,
    UnifiedStepInput,
    UnifiedStepOutput,
    UnifiedResponseInput,
    UnifiedResponseOutput,
    UnifiedAgentInput,
    UnifiedAgentOutput,
    UnifiedMessageModifier,
    UnifiedResponseExecutor,

    UnifiedAgentEvent,
    UnifiedAgentEventHandler,
    UnifiedAgentEventType
} from './types/types';

// Error types
export {
    UnifiedAgentError,
    UnifiedMessageProcessingError,
    UnifiedStepExecutionError,
    UnifiedResponseExecutionError,
    UnifiedToolExecutionError
} from './types/types';

// Core components
export {
    createDefaultMessageProcessor
} from './base/create/createInitialPromptGenerators';
export { InitialPromptGenerator } from './base/initialPromptGenerator';

export { AgentStep } from './base/agentStep'

export { ResponseExecutor } from './base/responseExecutor'

// Agent framework components
export { Agent } from './agent/agent';
export { CodeboltAgent, createCodeboltAgent, type CodeboltAgentConfig } from './agent/codeboltAgent';
export { Tool, createTool } from './agent/tools';
export { Workflow } from './agent/workflow';

// export {

//     createUnifiedAgentStep,
//     createBasicAgentStep
// } from './base/agentStep';





// Convenience exports for common use cases
// export { createQuickAgent, createAdvancedAgent } from './utils'; // TODO: Implement utils

// High-level Agent class

// Tool creation utilities




// Library types
export {
    type OpenAIMessage,
    type OpenAITool,
    type ToolResult,
    type CodeboltAPI,
    type AgentExecutionResult,
    type StreamChunk,
    type StreamCallback
} from './types/libTypes';
export { type LLMConfig } from './types/libTypes';





// Workflow step factories


// Orchestrator system
// export {
//     UnifiedOrchestrator,
//     createOrchestrator,
//     createRuntimeContext,
//     type OrchestratorConfig,
//     type RuntimeContext,
//     type OrchestratorResult,
//     type OrchestratorDecision,
//     type OrchestratorExecutionStep,
//     type OrchestratorMetrics
// } from './orchestrator/orchestrator';


