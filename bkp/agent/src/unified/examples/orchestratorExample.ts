/**
 * Orchestrator Pattern Example for Unified Agent Framework
 * 
 * This example demonstrates how to create and use an orchestrator that can
 * dynamically coordinate agents, workflows, and tools based on the pattern
 * described in the documentation.
 */

import { z } from 'zod';
import {
    Agent,
    createAgent,
    createTool,
    createWorkflow,
    createAgentStep,
    createToolStep,
    createTransformStep,
    UnifiedOrchestrator,
    createOrchestrator,
    createRuntimeContext,
    type OrchestratorConfig,
    type WorkflowConfig
} from '../index';

// ================================
// Example: Multi-Resource Orchestration
// ================================

async function orchestratorPatternExample() {
    console.log('=== Orchestrator Pattern Example ===');

    // Create Agent 1: Research Agent
    const agent1 = createAgent({
        name: 'Research Agent',
        instructions: 'You are a research specialist. Gather and synthesize information on given topics.',
        description: 'Specializes in research and information synthesis',
        tools: [
            createTool({
                id: 'research-tool',
                name: 'Research Tool',
                description: 'Conduct research on a given topic',
                inputSchema: z.object({
                    topic: z.string(),
                    depth: z.enum(['basic', 'detailed', 'comprehensive']).optional().default('detailed')
                }),
                execute: async ({ input }) => {
                    // Simulate research
                    return {
                        findings: `Comprehensive research on ${input.topic}`,
                        sources: ['Source 1', 'Source 2', 'Source 3'],
                        confidence: 0.85,
                        summary: `Key insights about ${input.topic} based on current research.`
                    };
                }
            })
        ]
    });

    // Create Agent 2: Analysis Agent
    const agent2 = createAgent({
        name: 'Analysis Agent',
        instructions: 'You are an analytical expert. Analyze data and provide insights.',
        description: 'Specializes in data analysis and insight generation',
        tools: [
            createTool({
                id: 'analysis-tool',
                name: 'Analysis Tool',
                description: 'Analyze data and generate insights',
                inputSchema: z.object({
                    data: z.string(),
                    analysisType: z.enum(['trend', 'pattern', 'correlation']).optional().default('trend')
                }),
                execute: async ({ input }) => {
                    // Simulate analysis
                    return {
                        insights: `Analysis reveals key trends in: ${input.data}`,
                        metrics: { accuracy: 0.92, relevance: 0.88 },
                        recommendations: ['Recommendation 1', 'Recommendation 2']
                    };
                }
            })
        ]
    });

    // Create Workflow 1: Research and Analysis Pipeline
    const workflow1Config: WorkflowConfig = {
        name: 'Research and Analysis Pipeline',
        description: 'Comprehensive research followed by detailed analysis',
        steps: [
            createAgentStep({
                id: 'research-step',
                name: 'Research Phase',
                description: 'Conduct initial research',
                agent: 'research-agent', // Reference by ID
                message: 'Research the topic: {{topic}} with {{depth}} level of detail',
                outputMapping: {
                    researchFindings: 'agentResult.response',
                    researchData: 'agentResult.toolResults'
                }
            }),
            createTransformStep({
                id: 'prepare-analysis',
                name: 'Prepare Analysis Data',
                description: 'Transform research data for analysis',
                transform: (data) => ({
                    analysisInput: `Research findings: ${data.researchFindings}`,
                    analysisType: 'trend'
                })
            }),
            createAgentStep({
                id: 'analysis-step',
                name: 'Analysis Phase',
                description: 'Analyze research findings',
                agent: 'analysis-agent', // Reference by ID
                message: 'Analyze this data: {{analysisInput}} using {{analysisType}} analysis',
                outputMapping: {
                    finalInsights: 'agentResult.response',
                    analysisMetrics: 'agentResult.toolResults'
                }
            })
        ],
        initialData: {
            topic: 'Artificial Intelligence Trends',
            depth: 'comprehensive'
        }
    };

    const workflow1 = createWorkflow(workflow1Config);
    
    // Add agents to workflow context
    workflow1.addAgent('research-agent', agent1);
    workflow1.addAgent('analysis-agent', agent2);

    // Create standalone tools
    const summaryTool = createTool({
        id: 'summary-tool',
        name: 'Summary Generator',
        description: 'Generate executive summaries',
        inputSchema: z.object({
            content: z.string(),
            length: z.enum(['short', 'medium', 'long']).optional().default('medium')
        }),
        execute: async ({ input }) => {
            return {
                summary: `Executive summary of: ${input.content.substring(0, 100)}...`,
                keyPoints: ['Point 1', 'Point 2', 'Point 3'],
                wordCount: input.length === 'short' ? 150 : input.length === 'medium' ? 300 : 500
            };
        }
    });

    const reportTool = createTool({
        id: 'report-generator',
        name: 'Report Generator',
        description: 'Generate formatted reports',
        inputSchema: z.object({
            data: z.record(z.unknown()),
            format: z.enum(['pdf', 'html', 'markdown']).optional().default('markdown')
        }),
        execute: async ({ input }) => {
            return {
                report: `# Generated Report\n\nData: ${JSON.stringify(input.data, null, 2)}`,
                format: input.format,
                generatedAt: new Date().toISOString()
            };
        }
    });

    // Create Orchestrator Configuration
    const orchestratorConfig: OrchestratorConfig = {
        name: 'Multi-Resource Orchestrator',
        description: 'Orchestrates agents, workflows, and tools dynamically',
        instructions: `You are an intelligent orchestrator that can coordinate multiple resources:

AVAILABLE RESOURCES:
- Agents: agent1 (research), agent2 (analysis)
- Workflows: workflow1 (research and analysis pipeline)
- Tools: summary-tool, report-generator

DECISION MAKING:
1. For research tasks → use agent1 or workflow1
2. For analysis tasks → use agent2 or workflow1
3. For summarization → use summary-tool
4. For report generation → use report-generator
5. For complex multi-step processes → use workflow1

Always consider:
- What the user is asking for
- What resources are best suited
- Whether a workflow or individual agents/tools are more appropriate
- The current context and previous executions

Make intelligent decisions about resource selection and execution order.`,
        
        agents: {
            agent1,
            agent2
        },
        
        workflows: {
            workflow1
        },
        
        tools: {
            'summary-tool': summaryTool,
            'report-generator': reportTool
        },
        
        limits: {
            maxSteps: 10,
            maxExecutionTime: 300000 // 5 minutes
        },
        
        decisionConfig: {
            explainDecisions: true,
            confidenceThreshold: 0.7,
            askConfirmation: false
        }
    };

    // Create the orchestrator
    const orchestrator = createOrchestrator(orchestratorConfig);

    // Create runtime context
    const runtimeContext = createRuntimeContext({
        userId: 'user123',
        customData: {
            userPreferences: {
                reportFormat: 'markdown',
                summaryLength: 'medium'
            }
        }
    });

    console.log('Starting orchestration...');

    // Test Case 1: Simple research request
    console.log('\n--- Test Case 1: Research Request ---');
    const result1 = await orchestrator.loop(
        'I need comprehensive research on emerging AI technologies in healthcare',
        { runtimeContext }
    );

    console.log('Research orchestration result:', {
        success: result1.success,
        steps: result1.executionSteps.length,
        response: result1.response.substring(0, 200) + '...',
        metrics: result1.metrics
    });

    // Test Case 2: Complex multi-step request
    console.log('\n--- Test Case 2: Complex Multi-Step Request ---');
    const result2 = await orchestrator.loop(
        'Research AI in finance, analyze the trends, and generate a comprehensive report with executive summary',
        { runtimeContext: createRuntimeContext() }
    );

    console.log('Complex orchestration result:', {
        success: result2.success,
        steps: result2.executionSteps.length,
        response: result2.response.substring(0, 200) + '...',
        resourcesUsed: {
            agents: result2.metrics.agentsExecuted,
            workflows: result2.metrics.workflowsExecuted,
            tools: result2.metrics.toolsExecuted
        }
    });

    // Test Case 3: Workflow-specific request
    console.log('\n--- Test Case 3: Workflow Request ---');
    const result3 = await orchestrator.loop(
        'Run the research and analysis workflow for blockchain technology',
        { runtimeContext: createRuntimeContext() }
    );

    console.log('Workflow orchestration result:', {
        success: result3.success,
        steps: result3.executionSteps.length,
        workflowsExecuted: result3.metrics.workflowsExecuted,
        averageConfidence: result3.metrics.averageConfidence
    });

    return { result1, result2, result3 };
}

// ================================
// Example: Dynamic Resource Selection
// ================================

async function dynamicResourceSelectionExample() {
    console.log('\n=== Dynamic Resource Selection Example ===');

    // Create specialized agents for different domains
    const techAgent = createAgent({
        name: 'Technology Expert',
        instructions: 'You are a technology expert specializing in software, hardware, and emerging tech.',
        tools: []
    });

    const businessAgent = createAgent({
        name: 'Business Strategist',
        instructions: 'You are a business strategist focusing on market analysis and strategic planning.',
        tools: []
    });

    const creativeAgent = createAgent({
        name: 'Creative Director',
        instructions: 'You are a creative director specializing in content creation and design.',
        tools: []
    });

    // Create domain-specific workflows
    const techWorkflow = createWorkflow({
        name: 'Technology Assessment',
        description: 'Comprehensive technology evaluation workflow',
        steps: [
            createAgentStep({
                id: 'tech-analysis',
                name: 'Technology Analysis',
                agent: techAgent,
                message: 'Analyze the technology: {{topic}} from technical feasibility perspective'
            })
        ]
    });

    const businessWorkflow = createWorkflow({
        name: 'Business Analysis',
        description: 'Business impact and market analysis workflow',
        steps: [
            createAgentStep({
                id: 'business-analysis',
                name: 'Business Analysis',
                agent: businessAgent,
                message: 'Analyze the business implications of: {{topic}}'
            })
        ]
    });

    // Smart orchestrator that selects resources based on context
    const smartOrchestrator = createOrchestrator({
        name: 'Smart Domain Orchestrator',
        instructions: `You are a smart orchestrator that selects the most appropriate resources based on the domain and context of the user's request.

DOMAIN DETECTION:
- Technology-related queries → use techAgent or techWorkflow
- Business-related queries → use businessAgent or businessWorkflow  
- Creative-related queries → use creativeAgent
- Multi-domain queries → use multiple agents/workflows

RESOURCE SELECTION LOGIC:
1. Analyze the user's request to identify the primary domain(s)
2. Select the most appropriate agent(s) or workflow(s)
3. For complex requests, coordinate multiple resources
4. Always explain your resource selection reasoning`,

        agents: {
            techAgent,
            businessAgent,
            creativeAgent
        },
        
        workflows: {
            techWorkflow,
            businessWorkflow
        },
        
        decisionConfig: {
            explainDecisions: true,
            confidenceThreshold: 0.6
        }
    });

    // Test different types of requests
    const testCases = [
        'Evaluate the technical feasibility of implementing blockchain in our supply chain',
        'What are the market opportunities for AI-powered customer service tools?',
        'Create a creative campaign concept for our new mobile app launch',
        'Analyze both the technical and business aspects of adopting cloud-native architecture'
    ];

    const results = [];
    
    for (const [index, testCase] of testCases.entries()) {
        console.log(`\n--- Test Case ${index + 1}: ${testCase.substring(0, 50)}... ---`);
        
        const result = await smartOrchestrator.loop(testCase, {
            runtimeContext: createRuntimeContext()
        });
        
        console.log('Result:', {
            success: result.success,
            resourcesUsed: {
                agents: result.metrics.agentsExecuted,
                workflows: result.metrics.workflowsExecuted
            },
            confidence: result.metrics.averageConfidence,
            executionTime: result.totalExecutionTime
        });
        
        results.push(result);
    }

    return results;
}

// ================================
// Example: Orchestrator as a Tool
// ================================

async function orchestratorAsToolExample() {
    console.log('\n=== Orchestrator as Tool Example ===');

    // Create a simple orchestrator
    const subOrchestrator = createOrchestrator({
        name: 'Sub-Orchestrator',
        instructions: 'You coordinate research and analysis tasks.',
        agents: {
            researcher: createAgent({
                name: 'Researcher',
                instructions: 'Conduct research on given topics.'
            }),
            analyzer: createAgent({
                name: 'Analyzer', 
                instructions: 'Analyze research data and provide insights.'
            })
        },
        workflows: {}
    });

    // Create a tool that wraps the orchestrator
    const orchestratorTool = createTool({
        id: 'research-orchestrator',
        name: 'Research Orchestrator',
        description: 'Orchestrate research and analysis using multiple agents',
        inputSchema: z.object({
            task: z.string(),
            requirements: z.array(z.string()).optional()
        }),
        execute: async ({ input }) => {
            const result = await subOrchestrator.loop(input.task);
            return {
                orchestrationResult: result.response,
                stepsExecuted: result.executionSteps.length,
                success: result.success,
                metrics: result.metrics
            };
        }
    });

    // Create a main agent that can use the orchestrator as a tool
    const mainAgent = createAgent({
        name: 'Main Coordinator',
        instructions: 'You are a main coordinator that can delegate complex tasks to specialized orchestrators.',
        tools: [orchestratorTool]
    });

    // Test using orchestrator as a tool
    const result = await mainAgent.execute(
        'I need a comprehensive analysis of renewable energy trends. Use the research orchestrator to coordinate this task.'
    );

    console.log('Orchestrator as tool result:', {
        success: result.success,
        response: result.response.substring(0, 300) + '...',
        toolsUsed: result.toolResults?.length || 0
    });

    return result;
}

// ================================
// Run All Examples
// ================================

export async function runOrchestratorExamples() {
    try {
        console.log('🚀 Starting Orchestrator Examples...\n');
        
        await orchestratorPatternExample();
        await dynamicResourceSelectionExample();
        await orchestratorAsToolExample();
        
        console.log('\n✅ All orchestrator examples completed successfully!');
    } catch (error) {
        console.error('❌ Orchestrator example failed:', error);
    }
}

// Export individual examples
export {
    orchestratorPatternExample,
    dynamicResourceSelectionExample,
    orchestratorAsToolExample
};
