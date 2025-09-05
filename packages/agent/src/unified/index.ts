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
    LLMConfig,
    UnifiedMessageInput,
    UnifiedMessageOutput,
    UnifiedStepInput,
    UnifiedStepOutput,
    UnifiedResponseInput,
    UnifiedResponseOutput,
    UnifiedAgentInput,
    UnifiedAgentOutput,
    UnifiedMessageModifier,
    UnifiedAgentStep,
    UnifiedResponseExecutor,
    UnifiedAgent,
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
    UnifiedMessageModifierImpl,
    createUnifiedMessageModifier,
    createBasicMessageModifier
} from './base/initialPromptGenerator';

export {
    UnifiedAgentStepImpl,
    createUnifiedAgentStep,
    createBasicAgentStep
} from './base/agentStep';

export {
    UnifiedResponseExecutorImpl,
    createUnifiedResponseExecutor,
    createBasicResponseExecutor
} from './base/responseExecutor';

// Main agent class
export {
    UnifiedAgentImpl,
    createUnifiedAgent,
    createBasicUnifiedAgent,
    createProductionUnifiedAgent
} from './agent/unifiedAgent';

// Convenience exports for common use cases
// export { createQuickAgent, createAdvancedAgent } from './utils'; // TODO: Implement utils

// High-level Agent class
export { 
    Agent, 
    createAgent,
    type AgentConfig,
    type ExecutionResult,
    type ExecutionOptions,
    type Tool,
    type ToolConfig
} from './agent/agent';

// Tool creation utilities
export {
    createTool,
    createTextTool,
    createFileTool,
    createHttpTool,
    createValidationTool,
    createTransformTool,
    toolsToOpenAIFormat,
    executeTool
} from './agent/tool';

// Processor types and base classes
export {
    BaseProcessor,
    BaseMessageModifier,
    RequestMessage,
    ProcessorError,
    ProcessorTimeoutError,
    ProcessorValidationError,
    type Processor,
    type ProcessorInput,
    type ProcessorOutput,
    type MessageModifier,
    type MessageModifierInput,
    type ProcessedMessage,
    type Message,
    type ToolCall as ProcessorToolCall
} from './types/processorTypes';

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

// Processor implementations
export {
    ConversationCompactorProcessor,
    FollowUpConversationProcessor,
    ConversationContinuityProcessor,
    LocalToolInterceptorProcessor,
    ToolValidationProcessor,
    ToolParameterModifierProcessor,
    type ConversationCompactorInfo,
    type ConversationCompactorProcessorOptions,
    type FollowUpConversationInfo,
    type FollowUpConversationProcessorOptions,
    type ConversationContinuityInfo,
    type ConversationContinuityProcessorOptions,
    type LocalToolInterceptorInfo,
    type LocalToolInterceptorProcessorOptions,
    type LocalToolHandler,
    type ToolValidationInfo,
    type ToolValidationProcessorOptions,
    type ToolParameterModificationInfo,
    type ParameterTransformation,
    type ToolParameterModifierProcessorOptions
} from './processors';

// Workflow system
export {
    UnifiedWorkflow,
    createWorkflow,
    type WorkflowConfig,
    type WorkflowStep,
    type WorkflowStepResult,
    type WorkflowContext,
    type WorkflowResult,
    type WorkflowMetadata,
    type WorkflowMetrics,
    type WorkflowStepType,
    type RetryConfig
} from './agent/workflow';

// Workflow step factories
export {
    createAgentStep,
    createMultiAgentStep,
    createToolStep,
    createBatchToolStep,
    createConditionalStep,
    createLoopStep,
    createTransformStep,
    createDelayStep,
    createValidationStep,
    type AgentStepConfig,
    type ToolStepConfig
} from './agent/workflowSteps';

// Orchestrator system
export {
    UnifiedOrchestrator,
    createOrchestrator,
    createRuntimeContext,
    type OrchestratorConfig,
    type RuntimeContext,
    type OrchestratorResult,
    type OrchestratorDecision,
    type OrchestratorExecutionStep,
    type OrchestratorMetrics
} from './orchestrator/orchestrator';

/**
 * Default export - the main unified agent class
 */
export { UnifiedAgentImpl as default } from './agent/unifiedAgent';
