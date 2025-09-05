/**
 * Comprehensive Workflow Example for Unified Agent Framework
 * 
 * This example demonstrates how to create and execute complex workflows
 * that integrate agents, tools, and control flow steps.
 */

import { z } from 'zod';
import {
    Agent,
    createAgent,
    createTool,
    createWorkflow,
    createAgentStep,
    createMultiAgentStep,
    createToolStep,
    createConditionalStep,
    createLoopStep,
    createTransformStep,
    createDelayStep,
    createValidationStep,
    type WorkflowConfig,
    type AgentConfig
} from '../index';

// ================================
// Example: Content Creation Workflow
// ================================

async function contentCreationWorkflowExample() {
    console.log('=== Content Creation Workflow Example ===');

    // Create specialized agents
    const researchAgent = createAgent({
        name: 'Research Agent',
        instructions: 'You are a research specialist. Gather comprehensive information on given topics.',
        tools: [
            createTool({
                id: 'web-search',
                name: 'Web Search',
                description: 'Search the web for information',
                inputSchema: z.object({
                    query: z.string(),
                    maxResults: z.number().optional()
                }),
                execute: async ({ input }) => {
                    // Simulate web search
                    return {
                        results: [
                            { title: `Research on ${input.query}`, content: `Detailed information about ${input.query}...` }
                        ]
                    };
                }
            })
        ]
    });

    const writerAgent = createAgent({
        name: 'Content Writer',
        instructions: 'You are a skilled content writer. Create engaging and informative content based on research.',
        tools: []
    });

    const editorAgent = createAgent({
        name: 'Editor',
        instructions: 'You are an editor. Review and improve content for clarity, grammar, and style.',
        tools: []
    });

    // Create content validation tool
    const contentValidator = createTool({
        id: 'content-validator',
        name: 'Content Validator',
        description: 'Validate content quality and completeness',
        inputSchema: z.object({
            content: z.string(),
            criteria: z.array(z.string())
        }),
        execute: async ({ input }) => {
            const score = Math.random() * 100; // Simulate validation score
            return {
                score,
                passed: score > 70,
                feedback: score > 70 ? 'Content meets quality standards' : 'Content needs improvement'
            };
        }
    });

    // Define the content creation workflow
    const contentWorkflowConfig: WorkflowConfig = {
        name: 'Content Creation Pipeline',
        description: 'End-to-end content creation with research, writing, and editing',
        initialData: {
            topic: 'Artificial Intelligence in Healthcare',
            targetAudience: 'Healthcare professionals',
            contentType: 'blog post',
            maxLength: 2000
        },
        steps: [
            // Step 1: Research phase
            createAgentStep({
                id: 'research-phase',
                name: 'Research Phase',
                description: 'Gather information on the topic',
                agent: researchAgent,
                message: 'Research the topic: {{topic}} for {{targetAudience}}. Focus on recent developments and practical applications.',
                outputMapping: {
                    researchData: 'agentResult.response',
                    researchSources: 'agentResult.toolResults'
                }
            }),

            // Step 2: Content outline creation
            createTransformStep({
                id: 'create-outline',
                name: 'Create Content Outline',
                description: 'Generate content outline based on research',
                transform: (data) => {
                    return {
                        outline: [
                            'Introduction',
                            'Current State of AI in Healthcare',
                            'Key Applications and Benefits',
                            'Challenges and Considerations',
                            'Future Outlook',
                            'Conclusion'
                        ],
                        estimatedLength: data.maxLength
                    };
                }
            }),

            // Step 3: Content writing
            createAgentStep({
                id: 'writing-phase',
                name: 'Content Writing',
                description: 'Write the content based on research and outline',
                agent: writerAgent,
                message: 'Write a {{contentType}} about {{topic}} for {{targetAudience}}. Use this research: {{researchData}} and follow this outline: {{outline}}. Target length: {{maxLength}} words.',
                outputMapping: {
                    firstDraft: 'agentResult.response'
                }
            }),

            // Step 4: Content validation
            createToolStep({
                id: 'validate-content',
                name: 'Validate Content Quality',
                description: 'Check content quality and completeness',
                tool: contentValidator,
                input: (context) => ({
                    content: context.data.firstDraft,
                    criteria: ['clarity', 'accuracy', 'engagement', 'completeness']
                }),
                outputMapping: {
                    validationScore: 'toolResult.score',
                    validationPassed: 'toolResult.passed',
                    validationFeedback: 'toolResult.feedback'
                }
            }),

            // Step 5: Conditional editing based on validation
            createConditionalStep({
                id: 'conditional-editing',
                name: 'Conditional Editing',
                description: 'Edit content if validation fails',
                condition: (context) => !context.data.validationPassed,
                trueSteps: [
                    createAgentStep({
                        id: 'editing-phase',
                        name: 'Content Editing',
                        description: 'Improve content based on feedback',
                        agent: editorAgent,
                        message: 'Edit and improve this content: {{firstDraft}}. Address this feedback: {{validationFeedback}}. Ensure it meets quality standards for {{targetAudience}}.',
                        outputMapping: {
                            editedContent: 'agentResult.response'
                        }
                    }),
                    // Re-validate after editing
                    createToolStep({
                        id: 'revalidate-content',
                        name: 'Re-validate Content',
                        description: 'Check improved content quality',
                        tool: contentValidator,
                        input: (context) => ({
                            content: context.data.editedContent || context.data.firstDraft,
                            criteria: ['clarity', 'accuracy', 'engagement', 'completeness']
                        }),
                        outputMapping: {
                            finalValidationScore: 'toolResult.score',
                            finalValidationPassed: 'toolResult.passed'
                        }
                    })
                ]
            }),

            // Step 6: Finalize content
            createTransformStep({
                id: 'finalize-content',
                name: 'Finalize Content',
                description: 'Prepare final content for publication',
                transform: (data) => {
                    const finalContent = data.editedContent || data.firstDraft;
                    return {
                        finalContent,
                        wordCount: finalContent.split(' ').length,
                        publicationReady: true,
                        metadata: {
                            topic: data.topic,
                            audience: data.targetAudience,
                            type: data.contentType,
                            createdAt: new Date().toISOString(),
                            validationScore: data.finalValidationScore || data.validationScore
                        }
                    };
                }
            })
        ],
        continueOnError: false,
        timeout: 300000, // 5 minutes
        maxParallelSteps: 2
    };

    // Create and execute the workflow
    const workflow = createWorkflow(contentWorkflowConfig);
    
    // Add agents to workflow context
    workflow.addAgent('research-agent', researchAgent);
    workflow.addAgent('writer-agent', writerAgent);
    workflow.addAgent('editor-agent', editorAgent);
    
    // Add tools to workflow context
    workflow.addTool('content-validator', contentValidator);

    console.log('Starting content creation workflow...');
    const result = await workflow.execute();

    console.log('Workflow completed:', {
        success: result.success,
        executionTime: result.executionTime,
        totalSteps: result.stepResults.length,
        finalContent: result.data.finalContent?.substring(0, 200) + '...',
        wordCount: result.data.wordCount,
        validationScore: result.data.finalValidationScore || result.data.validationScore
    });

    return result;
}

// ================================
// Example: Multi-Agent Collaboration
// ================================

async function multiAgentCollaborationExample() {
    console.log('\n=== Multi-Agent Collaboration Example ===');

    // Create specialized agents for different perspectives
    const techAgent = createAgent({
        name: 'Technical Expert',
        instructions: 'You are a technical expert. Focus on technical feasibility, implementation details, and technical risks.'
    });

    const businessAgent = createAgent({
        name: 'Business Analyst',
        instructions: 'You are a business analyst. Focus on business value, market opportunities, and ROI.'
    });

    const designAgent = createAgent({
        name: 'UX Designer',
        instructions: 'You are a UX designer. Focus on user experience, usability, and design considerations.'
    });

    // Multi-agent collaboration workflow
    const collaborationConfig: WorkflowConfig = {
        name: 'Product Feature Analysis',
        description: 'Multi-agent analysis of a new product feature',
        initialData: {
            feature: 'AI-powered chatbot for customer support',
            context: 'E-commerce platform with 1M+ users'
        },
        steps: [
            // Parallel analysis by different agents
            createMultiAgentStep({
                id: 'parallel-analysis',
                name: 'Parallel Feature Analysis',
                description: 'Multiple agents analyze the feature from different perspectives',
                agents: [
                    {
                        agent: techAgent,
                        role: 'technical',
                        message: 'Analyze the technical aspects of implementing {{feature}} for {{context}}. Consider architecture, scalability, and implementation challenges.'
                    },
                    {
                        agent: businessAgent,
                        role: 'business',
                        message: 'Analyze the business value of {{feature}} for {{context}}. Consider market impact, revenue potential, and competitive advantage.'
                    },
                    {
                        agent: designAgent,
                        role: 'design',
                        message: 'Analyze the UX/UI aspects of {{feature}} for {{context}}. Consider user journey, interface design, and accessibility.'
                    }
                ],
                collaborationMode: 'parallel'
            }),

            // Synthesis step
            createAgentStep({
                id: 'synthesis',
                name: 'Synthesis and Recommendation',
                description: 'Synthesize different perspectives into final recommendation',
                agent: businessAgent, // Lead agent for synthesis
                message: `Based on the following analyses, provide a comprehensive recommendation for implementing {{feature}}:

Technical Analysis: {{technical_result}}
Business Analysis: {{business_result}}
Design Analysis: {{design_result}}

Provide a final recommendation with priorities, timeline, and next steps.`,
                outputMapping: {
                    finalRecommendation: 'agentResult.response',
                    confidence: 'agentResult.metadata.confidence'
                }
            })
        ]
    };

    const collaborationWorkflow = createWorkflow(collaborationConfig);
    
    // Add agents
    collaborationWorkflow.addAgent('tech-agent', techAgent);
    collaborationWorkflow.addAgent('business-agent', businessAgent);
    collaborationWorkflow.addAgent('design-agent', designAgent);

    console.log('Starting multi-agent collaboration...');
    const result = await collaborationWorkflow.execute();

    console.log('Collaboration completed:', {
        success: result.success,
        executionTime: result.executionTime,
        recommendation: result.data.finalRecommendation?.substring(0, 300) + '...'
    });

    return result;
}

// ================================
// Example: Iterative Improvement Loop
// ================================

async function iterativeImprovementExample() {
    console.log('\n=== Iterative Improvement Example ===');

    const optimizerAgent = createAgent({
        name: 'Code Optimizer',
        instructions: 'You are a code optimization expert. Analyze code and suggest improvements for performance, readability, and maintainability.'
    });

    // Quality checker tool
    const qualityChecker = createTool({
        id: 'quality-checker',
        name: 'Code Quality Checker',
        description: 'Check code quality metrics',
        inputSchema: z.object({
            code: z.string(),
            language: z.string()
        }),
        execute: async ({ input }) => {
            // Simulate quality analysis
            const score = Math.random() * 100;
            return {
                score,
                issues: score < 80 ? ['Performance issues', 'Code complexity'] : [],
                suggestions: score < 80 ? ['Optimize loops', 'Reduce complexity'] : []
            };
        }
    });

    const iterativeConfig: WorkflowConfig = {
        name: 'Iterative Code Improvement',
        description: 'Iteratively improve code quality until threshold is met',
        initialData: {
            code: 'function fibonacci(n) { if(n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2); }',
            language: 'javascript',
            targetQuality: 85,
            maxIterations: 5
        },
        steps: [
            createLoopStep({
                id: 'improvement-loop',
                name: 'Code Improvement Loop',
                description: 'Iteratively improve code until quality threshold is met',
                condition: async (context, iteration) => {
                    if (iteration >= (context.data.maxIterations as number)) return false;
                    if (iteration === 0) return true; // Always run first iteration
                    
                    const currentQuality = context.data.currentQuality as number;
                    const targetQuality = context.data.targetQuality as number;
                    return currentQuality < targetQuality;
                },
                maxIterations: 5,
                iterationVariable: 'currentIteration',
                steps: [
                    // Check current quality
                    createToolStep({
                        id: 'check-quality',
                        name: 'Check Code Quality',
                        description: 'Analyze current code quality',
                        tool: qualityChecker,
                        input: (context) => ({
                            code: context.data.code,
                            language: context.data.language
                        }),
                        outputMapping: {
                            currentQuality: 'toolResult.score',
                            issues: 'toolResult.issues',
                            suggestions: 'toolResult.suggestions'
                        }
                    }),

                    // Improve code if needed
                    createConditionalStep({
                        id: 'improve-if-needed',
                        name: 'Improve Code If Needed',
                        description: 'Improve code if quality is below threshold',
                        condition: (context) => {
                            const currentQuality = context.data.currentQuality as number;
                            const targetQuality = context.data.targetQuality as number;
                            return currentQuality < targetQuality;
                        },
                        trueSteps: [
                            createAgentStep({
                                id: 'optimize-code',
                                name: 'Optimize Code',
                                description: 'Improve code based on quality issues',
                                agent: optimizerAgent,
                                message: `Improve this {{language}} code:

{{code}}

Current quality score: {{currentQuality}}
Target quality score: {{targetQuality}}
Issues found: {{issues}}
Suggestions: {{suggestions}}

Provide optimized code that addresses these issues.`,
                                outputMapping: {
                                    code: 'agentResult.response'
                                }
                            })
                        ]
                    })
                ]
            }),

            // Final validation
            createValidationStep({
                id: 'final-validation',
                name: 'Final Code Validation',
                description: 'Validate final code meets requirements',
                schema: z.object({
                    currentQuality: z.number().min(80),
                    code: z.string().min(10)
                }),
                stopOnFailure: false
            })
        ]
    };

    const iterativeWorkflow = createWorkflow(iterativeConfig);
    iterativeWorkflow.addAgent('optimizer', optimizerAgent);
    iterativeWorkflow.addTool('quality-checker', qualityChecker);

    console.log('Starting iterative improvement...');
    const result = await iterativeWorkflow.execute();

    console.log('Iterative improvement completed:', {
        success: result.success,
        iterations: result.data.currentIteration,
        finalQuality: result.data.currentQuality,
        finalCode: result.data.code
    });

    return result;
}

// ================================
// Example: Agent with Workflow Tools
// ================================

async function agentWithWorkflowExample() {
    console.log('\n=== Agent with Workflow Tools Example ===');

    // Create an agent that can execute workflows as tools
    const orchestratorAgent = createAgent({
        name: 'Workflow Orchestrator',
        instructions: 'You are a workflow orchestrator. You can execute complex workflows to accomplish tasks.',
        tools: []
    });

    // Add the content creation workflow as a tool
    const contentCreationTool = createTool({
        id: 'content-creation-workflow',
        name: 'Content Creation Workflow',
        description: 'Execute the complete content creation pipeline',
        inputSchema: z.object({
            topic: z.string(),
            targetAudience: z.string(),
            contentType: z.string().optional().default('blog post'),
            maxLength: z.number().optional().default(2000)
        }),
        execute: async ({ input }) => {
            // This would execute the content creation workflow
            // For demo purposes, we'll simulate it
            return {
                success: true,
                content: `Generated content about ${input.topic} for ${input.targetAudience}`,
                wordCount: input.maxLength * 0.8,
                qualityScore: 85
            };
        }
    });

    orchestratorAgent.addTool(contentCreationTool);

    // Test the agent with workflow capabilities
    const result = await orchestratorAgent.execute(
        'Create a comprehensive blog post about "Machine Learning in Finance" targeted at financial professionals. Make it around 1500 words.'
    );

    console.log('Agent with workflow completed:', {
        success: result.success,
        response: result.response.substring(0, 200) + '...',
        toolsUsed: result.toolResults?.length || 0
    });

    return result;
}

// ================================
// Run Examples
// ================================

export async function runWorkflowExamples() {
    try {
        await contentCreationWorkflowExample();
        await multiAgentCollaborationExample();
        await iterativeImprovementExample();
        await agentWithWorkflowExample();
        
        console.log('\n✅ All workflow examples completed successfully!');
    } catch (error) {
        console.error('❌ Workflow example failed:', error);
    }
}

// Export for use in other examples
export {
    contentCreationWorkflowExample,
    multiAgentCollaborationExample,
    iterativeImprovementExample,
    agentWithWorkflowExample
};
