/**
 * Documentation Pattern Example
 * 
 * This example implements the exact pattern described in the Orchestrator.md documentation
 * showing how agents, workflows, and tools can be used as tools within an orchestrator.
 */

import { z } from 'zod';
import {
    Agent,
    createAgent,
    createTool,
    createWorkflow,
    createAgentStep,
    UnifiedOrchestrator,
    createOrchestrator,
    createRuntimeContext,
    type WorkflowConfig,
    type OrchestratorConfig
} from '../index';

// ================================
// Documentation Pattern Implementation
// ================================

export async function documentationPatternExample() {
    console.log('=== Documentation Pattern Example ===');
    console.log('Implementing the exact pattern from Orchestrator.md\n');

    // Create Agent 1 - Research and Text Synthesis
    const agent1 = createAgent({
        name: 'Research Agent',
        instructions: 'You are a research specialist focused on gathering information and synthesizing text.',
        description: 'Specializes in research and text synthesis',
        tools: [
            createTool({
                id: 'research-city-info',
                name: 'Research City Information',
                description: 'Research comprehensive information about a city',
                inputSchema: z.object({
                    city: z.string(),
                    aspects: z.array(z.string()).optional().default(['demographics', 'economy', 'culture'])
                }),
                execute: async ({ input }) => {
                    // Simulate city research
                    return {
                        city: input.city,
                        demographics: `${input.city} has a diverse population with various age groups and backgrounds.`,
                        economy: `${input.city}'s economy is driven by multiple sectors including technology and services.`,
                        culture: `${input.city} has a rich cultural heritage with numerous attractions and events.`,
                        summary: `Comprehensive research completed for ${input.city} covering ${input.aspects.join(', ')}.`
                    };
                }
            })
        ]
    });

    // Create Agent 2 - Text Processing and Enhancement
    const agent2 = createAgent({
        name: 'Text Processing Agent',
        instructions: 'You are a text processing specialist focused on enhancing and refining content.',
        description: 'Specializes in text processing and content enhancement',
        tools: [
            createTool({
                id: 'enhance-text',
                name: 'Text Enhancement Tool',
                description: 'Enhance and refine text content',
                inputSchema: z.object({
                    text: z.string(),
                    style: z.enum(['formal', 'casual', 'academic']).optional().default('formal'),
                    length: z.enum(['short', 'medium', 'long']).optional().default('medium')
                }),
                execute: async ({ input }) => {
                    // Simulate text enhancement
                    return {
                        originalText: input.text,
                        enhancedText: `Enhanced ${input.style} version: ${input.text}`,
                        improvements: ['Improved clarity', 'Better structure', 'Enhanced readability'],
                        wordCount: input.length === 'short' ? 150 : input.length === 'medium' ? 300 : 500
                    };
                }
            })
        ]
    });

    // Create Agent Step 1 - as shown in documentation
    const agentStep1 = createAgentStep({
        id: 'agent-step',
        name: 'Research and Text Synthesis Step',
        description: 'This step is used to do research and text synthesis.',
        agent: agent1,
        message: 'Research comprehensive information about {{city}} and synthesize the findings.',
        inputMapping: {
            city: 'city'
        },
        outputMapping: {
            researchResults: 'agentResult.response',
            cityData: 'agentResult.toolResults'
        }
    });

    // Create Agent Step 2 - as shown in documentation  
    const agentStep2 = createAgentStep({
        id: 'agent-step-two',
        name: 'Text Processing Step',
        description: 'This step is used to process and enhance text.',
        agent: agent2,
        message: 'Process and enhance this text: {{text}}. Make it {{style}} and {{length}}.',
        inputMapping: {
            text: 'researchResults',
            style: 'textStyle',
            length: 'textLength'
        },
        outputMapping: {
            finalText: 'agentResult.response',
            enhancements: 'agentResult.toolResults'
        }
    });

    // Create Workflow 1 - as shown in documentation
    const workflow1Config: WorkflowConfig = {
        name: 'Research and Processing Workflow',
        description: 'Sequential workflow for research and text processing',
        steps: [agentStep1, agentStep2],
        initialData: {
            city: 'San Francisco',
            textStyle: 'formal',
            textLength: 'medium'
        }
    };

    const workflow1 = createWorkflow(workflow1Config);
    
    // Add agents to workflow context
    workflow1.addAgent('agent1', agent1);
    workflow1.addAgent('agent2', agent2);

    // Create Orchestrator - as shown in documentation
    const orchestratorConfig: OrchestratorConfig = {
        name: 'Test Network',
        description: 'Test orchestrator network demonstrating the documentation pattern',
        instructions: `You are a test orchestrator that coordinates agents and workflows.

Available Resources:
- agent1: Research and text synthesis specialist
- agent2: Text processing and enhancement specialist  
- workflow1: Complete research and processing pipeline

Decision Logic:
1. For research tasks → use agent1 or workflow1
2. For text processing → use agent2 or workflow1
3. For complete research + processing → use workflow1
4. Always consider the most efficient resource for the task`,

        agents: {
            agent1,
            agent2
        },
        
        workflows: {
            workflow1
        },
        
        limits: {
            maxSteps: 10,
            maxExecutionTime: 300000 // 5 minutes
        },
        
        decisionConfig: {
            explainDecisions: true,
            confidenceThreshold: 0.7
        }
    };

    const orchestrator = createOrchestrator(orchestratorConfig);

    // Create Runtime Context - as shown in documentation
    const runtimeContext = createRuntimeContext({
        userId: 'test-user',
        customData: {
            preferences: {
                city: 'New York',
                outputStyle: 'formal',
                outputLength: 'long'
            }
        }
    });

    // Execute orchestrator loop - as shown in documentation
    console.log('Executing orchestrator loop...');
    
    const result = await orchestrator.loop(
        'I need comprehensive research about New York City and then process that information into a formal, detailed report.',
        { runtimeContext }
    );

    console.log('\nOrchestrator execution completed:');
    console.log('Success:', result.success);
    console.log('Total Steps:', result.executionSteps.length);
    console.log('Execution Time:', result.totalExecutionTime, 'ms');
    console.log('Resources Used:');
    console.log('  - Agents:', result.metrics.agentsExecuted);
    console.log('  - Workflows:', result.metrics.workflowsExecuted);
    console.log('  - Tools:', result.metrics.toolsExecuted);
    console.log('\nFinal Response:');
    console.log(result.response.substring(0, 300) + '...');

    // Demonstrate step-by-step execution details
    console.log('\n--- Execution Steps ---');
    result.executionSteps.forEach((step, index) => {
        console.log(`${index + 1}. ${step.stepType.toUpperCase()}: ${step.resourceName}`);
        console.log(`   Success: ${step.success}`);
        console.log(`   Time: ${step.executionTime}ms`);
        if (step.metadata.reasoning) {
            console.log(`   Reasoning: ${step.metadata.reasoning}`);
        }
        console.log('');
    });

    return result;
}

// ================================
// Advanced Pattern: Nested Orchestration
// ================================

export async function nestedOrchestrationExample() {
    console.log('\n=== Nested Orchestration Example ===');
    console.log('Demonstrating orchestrators using other orchestrators as tools\n');

    // Create a specialized sub-orchestrator for content creation
    const contentOrchestrator = createOrchestrator({
        name: 'Content Creation Orchestrator',
        instructions: 'You specialize in content creation workflows.',
        agents: {
            writer: createAgent({
                name: 'Content Writer',
                instructions: 'You are a skilled content writer.'
            }),
            editor: createAgent({
                name: 'Content Editor', 
                instructions: 'You are a meticulous content editor.'
            })
        },
        workflows: {}
    });

    // Create a tool that wraps the content orchestrator
    const contentOrchestrationTool = createTool({
        id: 'content-orchestrator-tool',
        name: 'Content Creation Orchestrator',
        description: 'Execute content creation using specialized orchestrator',
        inputSchema: z.object({
            task: z.string(),
            requirements: z.array(z.string()).optional()
        }),
        execute: async ({ input }) => {
            const result = await contentOrchestrator.loop(input.task);
            return {
                content: result.response,
                success: result.success,
                stepsExecuted: result.executionSteps.length,
                executionTime: result.totalExecutionTime
            };
        }
    });

    // Create main orchestrator that can use the content orchestrator as a tool
    const mainOrchestrator = createOrchestrator({
        name: 'Main Orchestrator',
        instructions: 'You coordinate high-level tasks and can delegate to specialized orchestrators.',
        agents: {
            coordinator: createAgent({
                name: 'Task Coordinator',
                instructions: 'You coordinate complex tasks across multiple systems.',
                tools: [contentOrchestrationTool]
            })
        },
        workflows: {},
        tools: {
            'content-orchestrator': contentOrchestrationTool.toOpenAITool()
        }
    });

    // Test nested orchestration
    const result = await mainOrchestrator.loop(
        'Create a comprehensive blog post about artificial intelligence trends, including research, writing, and editing phases.'
    );

    console.log('Nested orchestration result:');
    console.log('Success:', result.success);
    console.log('Total Steps:', result.executionSteps.length);
    console.log('Response:', result.response.substring(0, 200) + '...');

    return result;
}

// ================================
// Pattern: Agents, Workflows, and Tools as Tools
// ================================

export async function agentWorkflowToolAsToolsExample() {
    console.log('\n=== Agents, Workflows, and Tools as Tools Example ===');
    console.log('Demonstrating how each resource type can be used as a tool\n');

    // 1. Agent as a Tool
    const researchAgent = createAgent({
        name: 'Research Specialist',
        instructions: 'You conduct thorough research on any topic.'
    });

    const agentAsTool = researchAgent.toTool();
    console.log('✓ Created agent as tool:', agentAsTool.name);

    // 2. Workflow as a Tool  
    const analysisWorkflow = createWorkflow({
        name: 'Analysis Pipeline',
        description: 'Complete analysis workflow',
        steps: [
            createAgentStep({
                id: 'analyze',
                name: 'Analysis Step',
                agent: researchAgent,
                message: 'Analyze: {{topic}}'
            })
        ]
    });

    const workflowAsTool = createTool({
        id: 'analysis-workflow-tool',
        name: 'Analysis Workflow',
        description: 'Execute complete analysis workflow',
        inputSchema: z.object({
            topic: z.string(),
            depth: z.enum(['basic', 'detailed']).optional().default('detailed')
        }),
        execute: async ({ input }) => {
            analysisWorkflow.updateContext({ topic: input.topic, depth: input.depth });
            const result = await analysisWorkflow.execute();
            return {
                analysisResult: result.data,
                success: result.success,
                executionTime: result.executionTime
            };
        }
    });

    console.log('✓ Created workflow as tool:', workflowAsTool.name);

    // 3. Regular Tool
    const calculatorTool = createTool({
        id: 'calculator',
        name: 'Calculator',
        description: 'Perform mathematical calculations',
        inputSchema: z.object({
            expression: z.string()
        }),
        execute: async ({ input }) => {
            // Simple calculation simulation
            return {
                expression: input.expression,
                result: `Calculated result for: ${input.expression}`,
                timestamp: new Date().toISOString()
            };
        }
    });

    console.log('✓ Created regular tool:', calculatorTool.name);

    // Create orchestrator that can use all three types as tools
    const multiToolOrchestrator = createOrchestrator({
        name: 'Multi-Tool Orchestrator',
        instructions: `You can use various types of tools:
        
1. Agent tools - for complex reasoning and conversation
2. Workflow tools - for structured multi-step processes  
3. Regular tools - for specific functions

Choose the appropriate tool type based on the task complexity and requirements.`,

        agents: {
            coordinator: createAgent({
                name: 'Tool Coordinator',
                instructions: 'You coordinate the use of different tool types.',
                tools: [agentAsTool, workflowAsTool, calculatorTool]
            })
        },
        workflows: {},
        tools: {
            'agent-tool': researchAgent.toOpenAITool(),
            'workflow-tool': workflowAsTool.toOpenAITool(),
            'calculator-tool': calculatorTool.toOpenAITool()
        }
    });

    // Test using different tool types
    const testCases = [
        'Research the latest developments in quantum computing', // Should use agent tool
        'Perform a complete analysis of market trends in renewable energy', // Should use workflow tool
        'Calculate the compound interest for $10,000 at 5% for 10 years' // Should use calculator tool
    ];

    const results = [];
    for (const [index, testCase] of testCases.entries()) {
        console.log(`\n--- Test Case ${index + 1}: ${testCase.substring(0, 40)}... ---`);
        
        const result = await multiToolOrchestrator.loop(testCase);
        
        console.log('Result:', {
            success: result.success,
            toolsUsed: result.metrics.toolsExecuted,
            agentsUsed: result.metrics.agentsExecuted,
            workflowsUsed: result.metrics.workflowsExecuted
        });
        
        results.push(result);
    }

    return results;
}

// ================================
// Run All Documentation Pattern Examples
// ================================

export async function runDocumentationPatternExamples() {
    try {
        console.log('🚀 Starting Documentation Pattern Examples...\n');
        
        await documentationPatternExample();
        await nestedOrchestrationExample();
        await agentWorkflowToolAsToolsExample();
        
        console.log('\n✅ All documentation pattern examples completed successfully!');
        console.log('\nKey Patterns Demonstrated:');
        console.log('1. ✓ Agent as a tool');
        console.log('2. ✓ Tool as a tool');
        console.log('3. ✓ Workflow as a tool');
        console.log('4. ✓ Orchestrator coordination');
        console.log('5. ✓ Dynamic resource selection');
        console.log('6. ✓ Nested orchestration');
        
    } catch (error) {
        console.error('❌ Documentation pattern example failed:', error);
    }
}
