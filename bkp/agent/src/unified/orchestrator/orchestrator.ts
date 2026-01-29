/**
 * Unified Orchestrator for Multi-Agent, Multi-Workflow, Multi-Tool Coordination
 * 
 * The Orchestrator can dynamically choose and execute agents, workflows, and tools
 * in any order based on context and user input. Unlike workflows which have fixed
 * execution order, the orchestrator makes intelligent decisions about what to execute.
 */

import { z } from 'zod';
import type {
    OpenAIMessage,
    OpenAITool,
    ToolResult,
    CodeboltAPI,
    LLMConfig
} from '../types/libTypes';
import type {
    Processor,
    ProcessorInput,
    ProcessorOutput
} from '../types/processorTypes';
import type {
    WorkflowResult,
    UnifiedWorkflow
} from '../agent/workflow';
import { Agent } from '../agent/agent';
import { createTool, executeTool } from '../agent/tool';

// ================================
// Orchestrator Types
// ================================

/**
 * Runtime context for orchestrator execution
 */
export interface RuntimeContext {
    /** Unique execution session ID */
    sessionId: string;
    /** User identifier */
    userId?: string;
    /** Current conversation state */
    conversationState: Record<string, unknown>;
    /** Execution history */
    executionHistory: OrchestratorExecutionStep[];
    /** Shared memory across executions */
    memory: Map<string, unknown>;
    /** Current step in the orchestration */
    currentStep: number;
    /** Maximum steps allowed */
    maxSteps: number;
    /** Execution start time */
    startTime: string;
    /** Custom context data */
    customData: Record<string, unknown>;
}

/**
 * Orchestrator execution step result
 */
export interface OrchestratorExecutionStep {
    /** Step ID */
    stepId: string;
    /** Step type */
    stepType: 'agent' | 'workflow' | 'tool' | 'decision' | 'memory';
    /** Resource that was executed */
    resourceId: string;
    /** Resource name */
    resourceName: string;
    /** Input provided to the resource */
    input: unknown;
    /** Output from the resource */
    output: unknown;
    /** Whether execution was successful */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Execution time in milliseconds */
    executionTime: number;
    /** Timestamp */
    timestamp: string;
    /** Additional metadata */
    metadata: Record<string, unknown>;
}

/**
 * Orchestrator decision result
 */
export interface OrchestratorDecision {
    /** What type of resource to execute next */
    resourceType: 'agent' | 'workflow' | 'tool' | 'complete' | 'clarify';
    /** ID of the resource to execute */
    resourceId?: string;
    /** Input to provide to the resource */
    input?: unknown;
    /** Reasoning behind the decision */
    reasoning: string;
    /** Confidence level (0-1) */
    confidence: number;
    /** Whether this completes the orchestration */
    isComplete: boolean;
    /** Follow-up actions needed */
    followUpActions?: string[];
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
    /** Orchestrator name */
    name: string;
    /** Orchestrator description */
    description?: string;
    /** Instructions for decision making */
    instructions: string;
    /** LLM configuration for decision making */
    llmConfig?: LLMConfig;
    /** Available agents */
    agents: Record<string, Agent>;
    /** Available workflows */
    workflows: Record<string, UnifiedWorkflow>;
    /** Available tools (beyond agent/workflow tools) */
    tools?: Record<string, OpenAITool>;
    /** Memory configuration */
    memory?: {
        persistent?: boolean;
        maxSize?: number;
        ttl?: number; // Time to live in milliseconds
    };
    /** Execution limits */
    limits?: {
        maxSteps?: number;
        maxExecutionTime?: number;
        maxMemoryUsage?: number;
    };
    /** Decision-making configuration */
    decisionConfig?: {
        /** Whether to explain decisions to user */
        explainDecisions?: boolean;
        /** Confidence threshold for auto-execution */
        confidenceThreshold?: number;
        /** Whether to ask for confirmation on low confidence */
        askConfirmation?: boolean;
    };
    /** Processors for orchestrator enhancement */
    processors?: Processor[];
}

/**
 * Orchestrator execution result
 */
export interface OrchestratorResult {
    /** Unique session ID */
    sessionId: string;
    /** Whether orchestration completed successfully */
    success: boolean;
    /** Final response to user */
    response: string;
    /** All execution steps */
    executionSteps: OrchestratorExecutionStep[];
    /** Final context state */
    finalContext: RuntimeContext;
    /** Total execution time */
    totalExecutionTime: number;
    /** Error message if failed */
    error?: string;
    /** Orchestration metrics */
    metrics: OrchestratorMetrics;
}

/**
 * Orchestrator performance metrics
 */
export interface OrchestratorMetrics {
    /** Total steps executed */
    totalSteps: number;
    /** Agents executed */
    agentsExecuted: number;
    /** Workflows executed */
    workflowsExecuted: number;
    /** Tools executed */
    toolsExecuted: number;
    /** Decisions made */
    decisionsMade: number;
    /** Average decision confidence */
    averageConfidence: number;
    /** Memory operations */
    memoryOperations: number;
    /** Total tokens used (if available) */
    totalTokens?: number;
}

// ================================
// Orchestrator Implementation
// ================================

/**
 * Main Orchestrator class for coordinating agents, workflows, and tools
 */
export class UnifiedOrchestrator {
    private config: OrchestratorConfig;
    private codebolt?: CodeboltAPI;
    private decisionAgent: Agent;

    constructor(config: OrchestratorConfig, codebolt?: CodeboltAPI) {
        this.config = {
            limits: {
                maxSteps: 20,
                maxExecutionTime: 600000, // 10 minutes
                maxMemoryUsage: 100 * 1024 * 1024 // 100MB
            },
            decisionConfig: {
                explainDecisions: true,
                confidenceThreshold: 0.7,
                askConfirmation: false
            },
            memory: {
                persistent: false,
                maxSize: 1000,
                ttl: 3600000 // 1 hour
            },
            ...config
        };
        this.codebolt = codebolt;
        
        // Create decision-making agent
        this.decisionAgent = this.createDecisionAgent();
    }

    /**
     * Create the internal decision-making agent
     */
    private createDecisionAgent(): Agent {
        const decisionTool = createTool({
            id: 'make-orchestration-decision',
            name: 'Make Orchestration Decision',
            description: 'Decide what resource to execute next in the orchestration',
            inputSchema: z.object({
                userMessage: z.string(),
                availableAgents: z.array(z.string()),
                availableWorkflows: z.array(z.string()),
                availableTools: z.array(z.string()),
                executionHistory: z.array(z.object({
                    stepType: z.string(),
                    resourceId: z.string(),
                    success: z.boolean(),
                    output: z.unknown()
                })),
                contextData: z.record(z.unknown())
            }),
            execute: async ({ input }) => {
                // This is a placeholder - in a real implementation, this would use
                // sophisticated decision logic or ML models
                const { userMessage, availableAgents, availableWorkflows, availableTools, executionHistory } = input;
                
                // Simple heuristic-based decision making
                if (executionHistory.length === 0) {
                    // First step - analyze what type of task this is
                    if (userMessage.toLowerCase().includes('workflow') || userMessage.toLowerCase().includes('process')) {
                        return {
                            resourceType: 'workflow',
                            resourceId: availableWorkflows[0],
                            reasoning: 'User mentioned workflow/process, starting with first available workflow',
                            confidence: 0.8,
                            isComplete: false
                        };
                    } else if (availableAgents.length > 0) {
                        return {
                            resourceType: 'agent',
                            resourceId: availableAgents[0],
                            reasoning: 'Starting with first available agent for general task',
                            confidence: 0.7,
                            isComplete: false
                        };
                    }
                }
                
                // Check if we have enough information to complete
                const lastStep = executionHistory[executionHistory.length - 1];
                if (lastStep && lastStep.success) {
                    return {
                        resourceType: 'complete',
                        reasoning: 'Task appears to be completed successfully',
                        confidence: 0.9,
                        isComplete: true
                    };
                }
                
                return {
                    resourceType: 'complete',
                    reasoning: 'No clear next step identified',
                    confidence: 0.5,
                    isComplete: true
                };
            }
        });

        return new Agent({
            name: 'Orchestrator Decision Agent',
            instructions: `${this.config.instructions}

You are the decision-making component of an orchestrator. Your job is to analyze the current situation and decide what resource (agent, workflow, or tool) should be executed next.

Available resources:
- Agents: ${Object.keys(this.config.agents).join(', ')}
- Workflows: ${Object.keys(this.config.workflows).join(', ')}
- Tools: ${Object.keys(this.config.tools || {}).join(', ')}

Consider:
1. The user's request and intent
2. What has already been executed
3. What information or capabilities are needed next
4. Whether the task is complete

Always use the make-orchestration-decision tool to provide structured decisions.`,
            tools: [decisionTool],
            llmConfig: this.config.llmConfig
        });
    }

    /**
     * Execute orchestration loop
     */
    async loop(userMessage: string, options: {
        runtimeContext?: Partial<RuntimeContext>;
        maxSteps?: number;
    } = {}): Promise<OrchestratorResult> {
        const startTime = Date.now();
        
        // Initialize runtime context
        const context = this.initializeRuntimeContext(userMessage, options.runtimeContext);
        
        try {
            // Apply processors if configured
            if (this.config.processors) {
                await this.applyProcessors(userMessage, context);
            }

            // Main orchestration loop
            while (!this.shouldStop(context)) {
                const decision = await this.makeDecision(userMessage, context);
                
                if (decision.isComplete) {
                    break;
                }

                await this.executeDecision(decision, context);
                context.currentStep++;
            }

            const totalExecutionTime = Date.now() - startTime;
            return this.createSuccessResult(context, totalExecutionTime);

        } catch (error) {
            const totalExecutionTime = Date.now() - startTime;
            return this.createErrorResult(context, error, totalExecutionTime);
        }
    }

    /**
     * Initialize runtime context
     */
    private initializeRuntimeContext(
        userMessage: string, 
        partial?: Partial<RuntimeContext>
    ): RuntimeContext {
        return {
            sessionId: partial?.sessionId || this.generateSessionId(),
            userId: partial?.userId,
            conversationState: partial?.conversationState || { userMessage },
            executionHistory: partial?.executionHistory || [],
            memory: partial?.memory || new Map(),
            currentStep: partial?.currentStep || 0,
            maxSteps: partial?.maxSteps || this.config.limits?.maxSteps || 20,
            startTime: new Date().toISOString(),
            customData: partial?.customData || {}
        };
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Apply orchestrator processors
     */
    private async applyProcessors(userMessage: string, context: RuntimeContext): Promise<void> {
        if (!this.config.processors) return;

        for (const processor of this.config.processors) {
            try {
                const input: ProcessorInput = {
                    message: {
                        messages: [{
                            role: 'user',
                            content: userMessage
                        }],
                        metadata: {
                            sessionId: context.sessionId,
                            step: context.currentStep
                        }
                    },
                    context: context.conversationState
                };

                await processor.processInput(input);
            } catch (error) {
                console.warn('Orchestrator processor failed:', error);
            }
        }
    }

    /**
     * Make orchestration decision
     */
    private async makeDecision(userMessage: string, context: RuntimeContext): Promise<OrchestratorDecision> {
        const decisionInput = {
            userMessage,
            availableAgents: Object.keys(this.config.agents),
            availableWorkflows: Object.keys(this.config.workflows),
            availableTools: Object.keys(this.config.tools || {}),
            executionHistory: context.executionHistory.map(step => ({
                stepType: step.stepType,
                resourceId: step.resourceId,
                success: step.success,
                output: step.output
            })),
            contextData: context.conversationState
        };

        const result = await this.decisionAgent.execute(
            `Analyze the current situation and decide what to execute next: ${JSON.stringify(decisionInput)}`
        );

        // Extract decision from agent response
        // In a real implementation, this would parse the structured tool output
        const decision: OrchestratorDecision = {
            resourceType: 'agent', // Default fallback
            resourceId: Object.keys(this.config.agents)[0],
            reasoning: 'Default decision - execute first available agent',
            confidence: 0.5,
            isComplete: context.currentStep >= context.maxSteps,
            input: { message: userMessage, context: context.conversationState }
        };

        // Record decision in execution history
        context.executionHistory.push({
            stepId: `decision_${context.currentStep}`,
            stepType: 'decision',
            resourceId: 'decision-agent',
            resourceName: 'Decision Making',
            input: decisionInput,
            output: decision,
            success: true,
            executionTime: 0,
            timestamp: new Date().toISOString(),
            metadata: { confidence: decision.confidence }
        });

        return decision;
    }

    /**
     * Execute orchestration decision
     */
    private async executeDecision(decision: OrchestratorDecision, context: RuntimeContext): Promise<void> {
        const stepId = `step_${context.currentStep}`;
        const startTime = Date.now();

        try {
            let result: unknown;
            let resourceName: string;

            switch (decision.resourceType) {
                case 'agent':
                    if (!decision.resourceId || !this.config.agents[decision.resourceId]) {
                        throw new Error(`Agent not found: ${decision.resourceId}`);
                    }
                    const agent = this.config.agents[decision.resourceId];
                    resourceName = agent.config.name;
                    
                    const agentInput = typeof decision.input === 'object' && decision.input && 'message' in decision.input
                        ? (decision.input as { message: string }).message
                        : String(decision.input);
                    
                    result = await agent.execute(agentInput);
                    break;

                case 'workflow':
                    if (!decision.resourceId || !this.config.workflows[decision.resourceId]) {
                        throw new Error(`Workflow not found: ${decision.resourceId}`);
                    }
                    const workflow = this.config.workflows[decision.resourceId];
                    resourceName = `Workflow: ${decision.resourceId}`;
                    
                    // Update workflow context with current data
                    if (decision.input && typeof decision.input === 'object') {
                        workflow.updateContext(decision.input as Record<string, unknown>);
                    }
                    
                    result = await workflow.execute();
                    break;

                case 'tool':
                    if (!decision.resourceId || !this.config.tools?.[decision.resourceId]) {
                        throw new Error(`Tool not found: ${decision.resourceId}`);
                    }
                    const tool = this.config.tools[decision.resourceId];
                    resourceName = tool.function.name;
                    
                    result = await executeTool(tool, decision.input, this.codebolt);
                    break;

                default:
                    throw new Error(`Unknown resource type: ${decision.resourceType}`);
            }

            // Record successful execution
            const executionStep: OrchestratorExecutionStep = {
                stepId,
                stepType: decision.resourceType,
                resourceId: decision.resourceId!,
                resourceName,
                input: decision.input,
                output: result,
                success: true,
                executionTime: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                metadata: {
                    reasoning: decision.reasoning,
                    confidence: decision.confidence
                }
            };

            context.executionHistory.push(executionStep);

            // Update conversation state with results
            if (result && typeof result === 'object') {
                context.conversationState = {
                    ...context.conversationState,
                    [`${decision.resourceType}_${decision.resourceId}_result`]: result
                };
            }

            // Update memory if configured
            if (this.config.memory?.persistent) {
                context.memory.set(`step_${context.currentStep}`, result);
            }

        } catch (error) {
            // Record failed execution
            const executionStep: OrchestratorExecutionStep = {
                stepId,
                stepType: decision.resourceType,
                resourceId: decision.resourceId || 'unknown',
                resourceName: decision.resourceId || 'Unknown Resource',
                input: decision.input,
                output: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                metadata: {
                    reasoning: decision.reasoning,
                    confidence: decision.confidence
                }
            };

            context.executionHistory.push(executionStep);
            throw error; // Re-throw to be handled by main loop
        }
    }

    /**
     * Check if orchestration should stop
     */
    private shouldStop(context: RuntimeContext): boolean {
        // Stop if max steps reached
        if (context.currentStep >= context.maxSteps) {
            return true;
        }

        // Stop if max execution time reached
        const elapsed = Date.now() - new Date(context.startTime).getTime();
        if (this.config.limits?.maxExecutionTime && elapsed > this.config.limits.maxExecutionTime) {
            return true;
        }

        // Stop if memory limit reached
        if (this.config.limits?.maxMemoryUsage) {
            const memoryUsage = this.estimateMemoryUsage(context);
            if (memoryUsage > this.config.limits.maxMemoryUsage) {
                return true;
            }
        }

        return false;
    }

    /**
     * Estimate memory usage (simplified)
     */
    private estimateMemoryUsage(context: RuntimeContext): number {
        return JSON.stringify(context).length * 2; // Rough estimate
    }

    /**
     * Create successful orchestration result
     */
    private createSuccessResult(context: RuntimeContext, totalExecutionTime: number): OrchestratorResult {
        const metrics = this.calculateMetrics(context);
        
        // Generate final response based on execution history
        const finalResponse = this.generateFinalResponse(context);

        return {
            sessionId: context.sessionId,
            success: true,
            response: finalResponse,
            executionSteps: context.executionHistory,
            finalContext: context,
            totalExecutionTime,
            metrics
        };
    }

    /**
     * Create error orchestration result
     */
    private createErrorResult(
        context: RuntimeContext, 
        error: unknown, 
        totalExecutionTime: number
    ): OrchestratorResult {
        const metrics = this.calculateMetrics(context);

        return {
            sessionId: context.sessionId,
            success: false,
            response: `Orchestration failed: ${error instanceof Error ? error.message : String(error)}`,
            executionSteps: context.executionHistory,
            finalContext: context,
            totalExecutionTime,
            error: error instanceof Error ? error.message : String(error),
            metrics
        };
    }

    /**
     * Calculate orchestration metrics
     */
    private calculateMetrics(context: RuntimeContext): OrchestratorMetrics {
        const steps = context.executionHistory;
        
        return {
            totalSteps: steps.length,
            agentsExecuted: steps.filter(s => s.stepType === 'agent').length,
            workflowsExecuted: steps.filter(s => s.stepType === 'workflow').length,
            toolsExecuted: steps.filter(s => s.stepType === 'tool').length,
            decisionsMade: steps.filter(s => s.stepType === 'decision').length,
            averageConfidence: this.calculateAverageConfidence(steps),
            memoryOperations: context.memory.size
        };
    }

    /**
     * Calculate average confidence from decisions
     */
    private calculateAverageConfidence(steps: OrchestratorExecutionStep[]): number {
        const decisions = steps.filter(s => s.stepType === 'decision' && s.metadata.confidence);
        if (decisions.length === 0) return 0;
        
        const totalConfidence = decisions.reduce((sum, step) => sum + (step.metadata.confidence as number), 0);
        return totalConfidence / decisions.length;
    }

    /**
     * Generate final response based on execution history
     */
    private generateFinalResponse(context: RuntimeContext): string {
        const successfulSteps = context.executionHistory.filter(s => s.success && s.stepType !== 'decision');
        
        if (successfulSteps.length === 0) {
            return "I wasn't able to complete any tasks successfully.";
        }

        const lastStep = successfulSteps[successfulSteps.length - 1];
        
        // Extract meaningful response from the last successful step
        if (lastStep.output && typeof lastStep.output === 'object') {
            const output = lastStep.output as Record<string, unknown>;
            if ('response' in output && typeof output.response === 'string') {
                return output.response;
            }
            if ('result' in output && typeof output.result === 'string') {
                return output.result;
            }
        }

        return `Completed orchestration with ${successfulSteps.length} successful steps. The final step was executed by ${lastStep.resourceName}.`;
    }

    /**
     * Add agent to orchestrator
     */
    addAgent(id: string, agent: Agent): void {
        this.config.agents[id] = agent;
    }

    /**
     * Add workflow to orchestrator
     */
    addWorkflow(id: string, workflow: UnifiedWorkflow): void {
        this.config.workflows[id] = workflow;
    }

    /**
     * Add tool to orchestrator
     */
    addTool(id: string, tool: OpenAITool): void {
        if (!this.config.tools) {
            this.config.tools = {};
        }
        this.config.tools[id] = tool;
    }

    /**
     * Get orchestrator configuration
     */
    getConfig(): Readonly<OrchestratorConfig> {
        return { ...this.config };
    }

    /**
     * Update orchestrator configuration
     */
    updateConfig(updates: Partial<OrchestratorConfig>): void {
        this.config = { ...this.config, ...updates };
    }
}

// ================================
// Factory Functions
// ================================

/**
 * Create a new orchestrator instance
 */
export function createOrchestrator(config: OrchestratorConfig, codebolt?: CodeboltAPI): UnifiedOrchestrator {
    return new UnifiedOrchestrator(config, codebolt);
}

/**
 * Create runtime context
 */
export function createRuntimeContext(options: Partial<RuntimeContext> = {}): RuntimeContext {
    return {
        sessionId: options.sessionId || `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: options.userId,
        conversationState: options.conversationState || {},
        executionHistory: options.executionHistory || [],
        memory: options.memory || new Map(),
        currentStep: options.currentStep || 0,
        maxSteps: options.maxSteps || 20,
        startTime: options.startTime || new Date().toISOString(),
        customData: options.customData || {}
    };
}
