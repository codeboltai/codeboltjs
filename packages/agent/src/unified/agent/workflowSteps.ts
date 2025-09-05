/**
 * Workflow Step Factories for Unified Agent Framework
 * 
 * Provides factory functions to create various types of workflow steps
 * including agent execution, tool execution, and control flow steps.
 */

import { z } from 'zod';
import type {
    WorkflowStep,
    WorkflowStepResult,
    WorkflowContext,
    RetryConfig
} from './workflow';
import type {
    OpenAIMessage,
    OpenAITool,
    ToolResult,
    CodeboltAPI
} from '../types/libTypes';
import { Agent } from './agent';
import { createTool, executeTool } from './tool';

// ================================
// Agent Step Factories
// ================================

/**
 * Configuration for agent execution step
 */
export interface AgentStepConfig {
    /** Agent instance or agent name from context */
    agent: Agent | string;
    /** Message to send to the agent */
    message: string | ((context: WorkflowContext) => string);
    /** Input mapping from workflow context to agent input */
    inputMapping?: Record<string, string>;
    /** Output mapping from agent result to workflow context */
    outputMapping?: Record<string, string>;
    /** Tools to make available to the agent */
    tools?: OpenAITool[];
    /** Whether to include conversation history */
    includeHistory?: boolean;
    /** Maximum iterations for agent execution */
    maxIterations?: number;
    /** Custom processors for this agent execution */
    processors?: string[];
}

/**
 * Create an agent execution step
 */
export function createAgentStep(config: AgentStepConfig & {
    id: string;
    name: string;
    description?: string;
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || `Execute agent: ${typeof config.agent === 'string' ? config.agent : config.agent.config.name}`,
        type: 'agent',
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            try {
                // Resolve agent instance
                const agent = typeof config.agent === 'string' 
                    ? context.agents.get(config.agent)
                    : config.agent;

                if (!agent) {
                    throw new Error(`Agent not found: ${config.agent}`);
                }

                // Apply input mapping
                let stepData = { ...context.data };
                if (config.inputMapping) {
                    for (const [stepKey, contextKey] of Object.entries(config.inputMapping)) {
                        if (context.data[contextKey] !== undefined) {
                            stepData[stepKey] = context.data[contextKey];
                        }
                    }
                }

                // Resolve message template
                const message = typeof config.message === 'function' 
                    ? config.message(context)
                    : config.message;

                // Replace template variables in message
                const resolvedMessage = message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                    return stepData[key] !== undefined ? String(stepData[key]) : match;
                });

                // Add tools if specified
                if (config.tools) {
                    config.tools.forEach(tool => {
                        agent.addTool(tool);
                    });
                }

                // Execute agent
                const result = await agent.execute(resolvedMessage, {
                    maxIterations: config.maxIterations,
                    includeHistory: config.includeHistory
                });

                // Apply output mapping
                let output: Record<string, unknown> = { 
                    agentResult: result,
                    response: result.response,
                    success: result.success,
                    iterations: result.iterations
                };

                if (config.outputMapping) {
                    const mappedOutput: Record<string, unknown> = {};
                    for (const [contextKey, resultKey] of Object.entries(config.outputMapping)) {
                        const value = resultKey.split('.').reduce((obj: unknown, key) => {
                            return obj && typeof obj === 'object' && key in obj 
                                ? (obj as Record<string, unknown>)[key] 
                                : undefined;
                        }, { agentResult: result });
                        
                        if (value !== undefined) {
                            mappedOutput[contextKey] = value;
                        }
                    }
                    output = { ...output, ...mappedOutput };
                }

                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: result.success,
                    output,
                    error: result.error,
                    executionTime: 0, // Will be set by workflow engine
                    attempts: 1,
                    metadata: {
                        agentName: agent.config.name,
                        iterations: result.iterations,
                        toolsUsed: result.toolResults?.length || 0
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };

            } catch (error) {
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    executionTime: 0,
                    attempts: 1,
                    metadata: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        }
    };
}

/**
 * Create a multi-agent collaboration step
 */
export function createMultiAgentStep(config: {
    id: string;
    name: string;
    description?: string;
    agents: Array<{
        agent: Agent | string;
        role: string;
        message: string | ((context: WorkflowContext) => string);
        order?: number;
    }>;
    collaborationMode: 'sequential' | 'parallel' | 'debate' | 'consensus';
    maxRounds?: number;
    consensusThreshold?: number;
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || 'Multi-agent collaboration',
        type: 'agent',
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            try {
                const results: Array<{
                    agent: string;
                    role: string;
                    result: unknown;
                }> = [];

                switch (config.collaborationMode) {
                    case 'sequential':
                        // Execute agents in order
                        const sortedAgents = [...config.agents].sort((a, b) => (a.order || 0) - (b.order || 0));
                        for (const agentConfig of sortedAgents) {
                            const agent = typeof agentConfig.agent === 'string' 
                                ? context.agents.get(agentConfig.agent)
                                : agentConfig.agent;

                            if (!agent) continue;

                            const message = typeof agentConfig.message === 'function'
                                ? agentConfig.message(context)
                                : agentConfig.message;

                            const result = await agent.execute(message);
                            results.push({
                                agent: typeof agentConfig.agent === 'string' ? agentConfig.agent : agent.config.name,
                                role: agentConfig.role,
                                result
                            });

                            // Update context with intermediate results
                            context.data[`${agentConfig.role}_result`] = result;
                        }
                        break;

                    case 'parallel':
                        // Execute all agents in parallel
                        const parallelPromises = config.agents.map(async agentConfig => {
                            const agent = typeof agentConfig.agent === 'string' 
                                ? context.agents.get(agentConfig.agent)
                                : agentConfig.agent;

                            if (!agent) return null;

                            const message = typeof agentConfig.message === 'function'
                                ? agentConfig.message(context)
                                : agentConfig.message;

                            const result = await agent.execute(message);
                            return {
                                agent: typeof agentConfig.agent === 'string' ? agentConfig.agent : agent.config.name,
                                role: agentConfig.role,
                                result
                            };
                        });

                        const parallelResults = await Promise.all(parallelPromises);
                        results.push(...parallelResults.filter(r => r !== null) as typeof results);
                        break;

                    case 'debate':
                    case 'consensus':
                        // Implement debate/consensus logic
                        const maxRounds = config.maxRounds || 3;
                        for (let round = 0; round < maxRounds; round++) {
                            const roundResults = [];
                            
                            for (const agentConfig of config.agents) {
                                const agent = typeof agentConfig.agent === 'string' 
                                    ? context.agents.get(agentConfig.agent)
                                    : agentConfig.agent;

                                if (!agent) continue;

                                // Include previous round results in message
                                const previousResults = results.map(r => 
                                    `${r.role}: ${JSON.stringify(r.result)}`
                                ).join('\n');

                                const baseMessage = typeof agentConfig.message === 'function'
                                    ? agentConfig.message(context)
                                    : agentConfig.message;

                                const message = round > 0 
                                    ? `${baseMessage}\n\nPrevious responses:\n${previousResults}`
                                    : baseMessage;

                                const result = await agent.execute(message);
                                roundResults.push({
                                    agent: typeof agentConfig.agent === 'string' ? agentConfig.agent : agent.config.name,
                                    role: agentConfig.role,
                                    result
                                });
                            }
                            
                            results.push(...roundResults);
                        }
                        break;
                }

                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: true,
                    output: {
                        collaborationResults: results,
                        mode: config.collaborationMode,
                        totalAgents: config.agents.length
                    },
                    executionTime: 0,
                    attempts: 1,
                    metadata: {
                        collaborationMode: config.collaborationMode,
                        agentCount: config.agents.length,
                        resultCount: results.length
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };

            } catch (error) {
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    executionTime: 0,
                    attempts: 1,
                    metadata: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        }
    };
}

// ================================
// Tool Step Factories
// ================================

/**
 * Configuration for tool execution step
 */
export interface ToolStepConfig {
    /** Tool instance or tool name from context */
    tool: OpenAITool | string;
    /** Tool input parameters */
    input: Record<string, unknown> | ((context: WorkflowContext) => Record<string, unknown>);
    /** Input mapping from workflow context */
    inputMapping?: Record<string, string>;
    /** Output mapping to workflow context */
    outputMapping?: Record<string, string>;
    /** Whether to validate tool input/output */
    validate?: boolean;
}

/**
 * Create a tool execution step
 */
export function createToolStep(config: ToolStepConfig & {
    id: string;
    name: string;
    description?: string;
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || `Execute tool: ${typeof config.tool === 'string' ? config.tool : config.tool.function.name}`,
        type: 'tool',
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            try {
                // Resolve tool instance
                const tool = typeof config.tool === 'string' 
                    ? context.tools.get(config.tool)
                    : config.tool;

                if (!tool) {
                    throw new Error(`Tool not found: ${config.tool}`);
                }

                // Prepare input
                let toolInput = typeof config.input === 'function' 
                    ? config.input(context)
                    : config.input;

                // Apply input mapping
                if (config.inputMapping) {
                    const mappedInput: Record<string, unknown> = {};
                    for (const [toolKey, contextKey] of Object.entries(config.inputMapping)) {
                        if (context.data[contextKey] !== undefined) {
                            mappedInput[toolKey] = context.data[contextKey];
                        }
                    }
                    toolInput = { ...toolInput, ...mappedInput };
                }

                // Execute tool
                const result = await executeTool(tool, toolInput, context.codebolt);

                // Apply output mapping
                let output: Record<string, unknown> = { 
                    toolResult: result,
                    toolName: tool.function.name
                };

                if (config.outputMapping) {
                    const mappedOutput: Record<string, unknown> = {};
                    for (const [contextKey, resultKey] of Object.entries(config.outputMapping)) {
                        const value = resultKey.split('.').reduce((obj: unknown, key) => {
                            return obj && typeof obj === 'object' && key in obj 
                                ? (obj as Record<string, unknown>)[key] 
                                : undefined;
                        }, { toolResult: result });
                        
                        if (value !== undefined) {
                            mappedOutput[contextKey] = value;
                        }
                    }
                    output = { ...output, ...mappedOutput };
                }

                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: true,
                    output,
                    executionTime: 0,
                    attempts: 1,
                    metadata: {
                        toolName: tool.function.name,
                        inputSize: JSON.stringify(toolInput).length,
                        outputSize: JSON.stringify(result).length
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };

            } catch (error) {
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    executionTime: 0,
                    attempts: 1,
                    metadata: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        }
    };
}

/**
 * Create a batch tool execution step
 */
export function createBatchToolStep(config: {
    id: string;
    name: string;
    description?: string;
    tool: OpenAITool | string;
    inputs: Array<Record<string, unknown>> | ((context: WorkflowContext) => Array<Record<string, unknown>>);
    batchMode: 'parallel' | 'sequential';
    maxConcurrency?: number;
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || 'Batch tool execution',
        type: 'tool',
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            try {
                const tool = typeof config.tool === 'string' 
                    ? context.tools.get(config.tool)
                    : config.tool;

                if (!tool) {
                    throw new Error(`Tool not found: ${config.tool}`);
                }

                const inputs = typeof config.inputs === 'function' 
                    ? config.inputs(context)
                    : config.inputs;

                const results: unknown[] = [];

                if (config.batchMode === 'parallel') {
                    const maxConcurrency = config.maxConcurrency || 5;
                    const batches = [];
                    
                    for (let i = 0; i < inputs.length; i += maxConcurrency) {
                        batches.push(inputs.slice(i, i + maxConcurrency));
                    }

                    for (const batch of batches) {
                        const batchPromises = batch.map(input => executeTool(tool, input, context.codebolt));
                        const batchResults = await Promise.all(batchPromises);
                        results.push(...batchResults);
                    }
                } else {
                    // Sequential execution
                    for (const input of inputs) {
                        const result = await executeTool(tool, input, context.codebolt);
                        results.push(result);
                    }
                }

                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: true,
                    output: {
                        batchResults: results,
                        totalInputs: inputs.length,
                        successCount: results.length
                    },
                    executionTime: 0,
                    attempts: 1,
                    metadata: {
                        toolName: tool.function.name,
                        batchMode: config.batchMode,
                        inputCount: inputs.length,
                        resultCount: results.length
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };

            } catch (error) {
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    executionTime: 0,
                    attempts: 1,
                    metadata: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        }
    };
}

// ================================
// Control Flow Steps
// ================================

/**
 * Create a conditional step
 */
export function createConditionalStep(config: {
    id: string;
    name: string;
    description?: string;
    condition: (context: WorkflowContext) => boolean | Promise<boolean>;
    trueSteps: WorkflowStep[];
    falseSteps?: WorkflowStep[];
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || 'Conditional execution',
        type: 'condition',
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            try {
                const conditionResult = await config.condition(context);
                const stepsToExecute = conditionResult ? config.trueSteps : (config.falseSteps || []);
                
                const stepResults: WorkflowStepResult[] = [];
                
                // Execute conditional steps
                for (const step of stepsToExecute) {
                    const result = await step.execute(context);
                    stepResults.push(result);
                    
                    // Update context with step output
                    if (result.success && result.output && typeof result.output === 'object') {
                        context.data = { ...context.data, ...result.output as Record<string, unknown> };
                    }
                }

                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: stepResults.every(r => r.success),
                    output: {
                        conditionResult,
                        branchExecuted: conditionResult ? 'true' : 'false',
                        stepResults,
                        executedSteps: stepResults.length
                    },
                    executionTime: stepResults.reduce((sum, r) => sum + r.executionTime, 0),
                    attempts: 1,
                    metadata: {
                        conditionResult,
                        branchExecuted: conditionResult ? 'true' : 'false',
                        subSteps: stepResults.length
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };

            } catch (error) {
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    executionTime: 0,
                    attempts: 1,
                    metadata: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        }
    };
}

/**
 * Create a loop step
 */
export function createLoopStep(config: {
    id: string;
    name: string;
    description?: string;
    condition: (context: WorkflowContext, iteration: number) => boolean | Promise<boolean>;
    steps: WorkflowStep[];
    maxIterations?: number;
    iterationVariable?: string;
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || 'Loop execution',
        type: 'loop',
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            try {
                const maxIterations = config.maxIterations || 100;
                const iterationVariable = config.iterationVariable || 'iteration';
                const allStepResults: WorkflowStepResult[] = [];
                
                let iteration = 0;
                while (iteration < maxIterations && await config.condition(context, iteration)) {
                    // Set iteration variable in context
                    context.data[iterationVariable] = iteration;
                    
                    // Execute loop steps
                    for (const step of config.steps) {
                        const result = await step.execute(context);
                        allStepResults.push(result);
                        
                        // Update context with step output
                        if (result.success && result.output && typeof result.output === 'object') {
                            context.data = { ...context.data, ...result.output as Record<string, unknown> };
                        }
                    }
                    
                    iteration++;
                }

                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: allStepResults.every(r => r.success),
                    output: {
                        iterations: iteration,
                        stepResults: allStepResults,
                        totalSteps: allStepResults.length
                    },
                    executionTime: allStepResults.reduce((sum, r) => sum + r.executionTime, 0),
                    attempts: 1,
                    metadata: {
                        iterations: iteration,
                        maxIterations,
                        subSteps: allStepResults.length
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };

            } catch (error) {
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    executionTime: 0,
                    attempts: 1,
                    metadata: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        }
    };
}

// ================================
// Utility Steps
// ================================

/**
 * Create a data transformation step
 */
export function createTransformStep(config: {
    id: string;
    name: string;
    description?: string;
    transform: (data: Record<string, unknown>) => unknown | Promise<unknown>;
    inputSchema?: z.ZodType;
    outputSchema?: z.ZodType;
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || 'Transform data',
        type: 'transform',
        inputSchema: config.inputSchema,
        outputSchema: config.outputSchema,
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            try {
                const output = await config.transform(context.data);
                
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: true,
                    output,
                    executionTime: 0,
                    attempts: 1,
                    metadata: {},
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };

            } catch (error) {
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    executionTime: 0,
                    attempts: 1,
                    metadata: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        }
    };
}

/**
 * Create a delay step
 */
export function createDelayStep(config: {
    id: string;
    name: string;
    description?: string;
    delay: number | ((context: WorkflowContext) => number);
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || 'Delay execution',
        type: 'delay',
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            const delay = typeof config.delay === 'function' ? config.delay(context) : config.delay;
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return {
                stepId: config.id,
                stepName: config.name,
                success: true,
                output: { delayMs: delay },
                executionTime: delay,
                attempts: 1,
                metadata: { delayMs: delay },
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };
        }
    };
}

/**
 * Create a validation step
 */
export function createValidationStep(config: {
    id: string;
    name: string;
    description?: string;
    schema: z.ZodType;
    field?: string;
    stopOnFailure?: boolean;
}): WorkflowStep {
    return {
        id: config.id,
        name: config.name,
        description: config.description || `Validate ${config.field || 'data'}`,
        type: 'validation',
        execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
            try {
                const dataToValidate = config.field 
                    ? context.data[config.field]
                    : context.data;
                    
                const validatedData = config.schema.parse(dataToValidate);
                
                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: true,
                    output: config.field 
                        ? { [config.field]: validatedData }
                        : validatedData,
                    executionTime: 0,
                    attempts: 1,
                    metadata: { validationPassed: true },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };

            } catch (error) {
                const errorMessage = error instanceof z.ZodError
                    ? `Validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`
                    : error instanceof Error ? error.message : String(error);

                return {
                    stepId: config.id,
                    stepName: config.name,
                    success: !config.stopOnFailure,
                    error: errorMessage,
                    executionTime: 0,
                    attempts: 1,
                    metadata: { 
                        validationError: true,
                        stopOnFailure: config.stopOnFailure || false
                    },
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString()
                };
            }
        }
    };
}
