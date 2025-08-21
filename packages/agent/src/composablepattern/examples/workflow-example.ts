/**
 * @fileoverview Workflow Examples
 * @description Examples showing how to create and execute workflows with multiple agents
 */

import { 
  ComposableAgent, 
  createTool, 
  createInMemoryMemory,
  z 
} from '../index';

import {
  Workflow,
  createWorkflow,
  createAgentStep,
  createTransformStep,
  createConditionalStep,
  createDelayStep
} from '../workflow';

// ================================
// Example: Content Creation Workflow
// ================================

// Create research agent
const researchAgent = new ComposableAgent({
  name: 'Research Agent',
  instructions: `
    You are a research assistant that gathers information on topics.
    When given a topic, provide key facts, statistics, and insights.
    Structure your response with clear sections and bullet points.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  memory: createInMemoryMemory()
});

// Create writing agent
const writingAgent = new ComposableAgent({
  name: 'Writing Agent',
  instructions: `
    You are a professional content writer.
    Take research information and create engaging, well-structured content.
    Use clear headings, compelling introductions, and actionable conclusions.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  memory: createInMemoryMemory()
});

// Create review agent
const reviewAgent = new ComposableAgent({
  name: 'Review Agent',
  instructions: `
    You are an editor that reviews content for quality.
    Check for clarity, grammar, structure, and engagement.
    Provide a quality score (1-10) and specific improvement suggestions.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  memory: createInMemoryMemory()
});

// Content creation workflow
export const contentCreationWorkflow = createWorkflow({
  name: 'Content Creation Pipeline',
  description: 'Research, write, and review content creation workflow',
  initialData: {
    topic: 'The Future of AI in Healthcare'
  },
  steps: [
    // Step 1: Research the topic
    createAgentStep({
      id: 'research',
      name: 'Research Topic',
      agent: researchAgent,
      messageTemplate: 'Research the topic: {{topic}}. Provide comprehensive information including key trends, statistics, and expert insights.',
      outputMapping: {
        'researchData': 'agentResult.message'
      }
    }),

    // Step 2: Write initial draft
    createAgentStep({
      id: 'write-draft',
      name: 'Write Initial Draft',
      agent: writingAgent,
      messageTemplate: 'Write a comprehensive article about {{topic}} using this research: {{researchData}}',
      outputMapping: {
        'firstDraft': 'agentResult.message'
      }
    }),

    // Step 3: Review the content
    createAgentStep({
      id: 'review',
      name: 'Review Content',
      agent: reviewAgent,
      messageTemplate: 'Review this article and provide a quality score and suggestions: {{firstDraft}}',
      outputMapping: {
        'reviewFeedback': 'agentResult.message'
      }
    }),

    // Step 4: Extract quality score
    createTransformStep({
      id: 'extract-score',
      name: 'Extract Quality Score',
      transform: (data) => {
        // Simple regex to extract score (in real implementation, you might use more sophisticated parsing)
        const scoreMatch = data.reviewFeedback?.match(/score[:\s]*(\d+)/i);
        const qualityScore = scoreMatch ? parseInt(scoreMatch[1]) : 5;
        return { qualityScore };
      }
    }),

    // Step 5: Conditional improvement
    createConditionalStep({
      id: 'improvement-check',
      name: 'Check if Improvement Needed',
      condition: (context) => context.data.qualityScore < 8,
      trueBranch: [
        createAgentStep({
          id: 'improve-content',
          name: 'Improve Content',
          agent: writingAgent,
          messageTemplate: 'Improve this article based on the feedback: {{reviewFeedback}}\n\nOriginal article: {{firstDraft}}',
          outputMapping: {
            'finalDraft': 'agentResult.message'
          }
        })
      ],
      falseBranch: [
        createTransformStep({
          id: 'use-original',
          name: 'Use Original Draft',
          transform: (data) => ({ finalDraft: data.firstDraft })
        })
      ]
    }),

    // Step 6: Final formatting
    createTransformStep({
      id: 'format-output',
      name: 'Format Final Output',
      transform: (data) => ({
        result: {
          topic: data.topic,
          finalContent: data.finalDraft,
          qualityScore: data.qualityScore,
          researchData: data.researchData,
          reviewFeedback: data.reviewFeedback
        }
      })
    })
  ]
});

// ================================
// Example: Customer Support Workflow
// ================================

// Create classification agent
const classificationAgent = new ComposableAgent({
  name: 'Classification Agent',
  instructions: `
    You are a customer support classifier.
    Analyze customer messages and classify them into categories:
    - technical_issue
    - billing_question
    - feature_request
    - general_inquiry
    
    Also determine urgency level: low, medium, high, critical
    
    Respond in JSON format: {"category": "...", "urgency": "...", "summary": "..."}
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  memory: createInMemoryMemory()
});

// Create technical support agent
const technicalAgent = new ComposableAgent({
  name: 'Technical Support Agent',
  instructions: `
    You are a technical support specialist.
    Provide detailed troubleshooting steps and solutions for technical issues.
    Be clear, step-by-step, and ask clarifying questions if needed.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  memory: createInMemoryMemory()
});

// Create billing agent
const billingAgent = new ComposableAgent({
  name: 'Billing Support Agent',
  instructions: `
    You are a billing support specialist.
    Help customers with billing questions, payment issues, and account inquiries.
    Be helpful and provide clear explanations of charges and policies.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  memory: createInMemoryMemory()
});

// Customer support workflow
export const customerSupportWorkflow = createWorkflow({
  name: 'Customer Support Pipeline',
  description: 'Automated customer support classification and routing',
  initialData: {
    customerMessage: "I'm having trouble logging into my account and I'm getting an error message",
    customerId: "CUST-12345"
  },
  steps: [
    // Step 1: Classify the inquiry
    createAgentStep({
      id: 'classify',
      name: 'Classify Customer Inquiry',
      agent: classificationAgent,
      messageTemplate: 'Classify this customer message: {{customerMessage}}',
      outputMapping: {
        'classification': 'agentResult.message'
      }
    }),

    // Step 2: Parse classification result
    createTransformStep({
      id: 'parse-classification',
      name: 'Parse Classification',
      transform: (data) => {
        try {
          const parsed = JSON.parse(data.classification);
          return {
            category: parsed.category,
            urgency: parsed.urgency,
            summary: parsed.summary
          };
        } catch (error) {
          return {
            category: 'general_inquiry',
            urgency: 'medium',
            summary: 'Classification parsing failed'
          };
        }
      }
    }),

    // Step 3: Add delay for high priority items (simulate escalation)
    createConditionalStep({
      id: 'urgency-check',
      name: 'Check Urgency Level',
      condition: (context) => context.data.urgency === 'critical' || context.data.urgency === 'high',
      trueBranch: [
        createTransformStep({
          id: 'escalate',
          name: 'Escalate to Human Agent',
          transform: (data) => ({
            escalated: true,
            escalationReason: `High urgency ${data.urgency} issue: ${data.summary}`
          })
        })
      ]
    }),

    // Step 4: Route to appropriate agent based on category
    createConditionalStep({
      id: 'route-by-category',
      name: 'Route by Category',
      condition: (context) => !context.data.escalated,
      trueBranch: [
        createConditionalStep({
          id: 'technical-routing',
          name: 'Handle Technical Issues',
          condition: (context) => context.data.category === 'technical_issue',
          trueBranch: [
            createAgentStep({
              id: 'technical-support',
              name: 'Technical Support Response',
              agent: technicalAgent,
              messageTemplate: 'Help with this technical issue: {{customerMessage}}\nCustomer ID: {{customerId}}',
              outputMapping: {
                'supportResponse': 'agentResult.message'
              }
            })
          ]
        }),

        createConditionalStep({
          id: 'billing-routing',
          name: 'Handle Billing Questions',
          condition: (context) => context.data.category === 'billing_question',
          trueBranch: [
            createAgentStep({
              id: 'billing-support',
              name: 'Billing Support Response',
              agent: billingAgent,
              messageTemplate: 'Help with this billing question: {{customerMessage}}\nCustomer ID: {{customerId}}',
              outputMapping: {
                'supportResponse': 'agentResult.message'
              }
            })
          ]
        })
      ]
    }),

    // Step 5: Generate final response
    createTransformStep({
      id: 'generate-response',
      name: 'Generate Final Response',
      transform: (data) => ({
        finalResponse: {
          customerId: data.customerId,
          category: data.category,
          urgency: data.urgency,
          escalated: data.escalated || false,
          response: data.supportResponse || 'Your inquiry has been escalated to a human agent.',
          timestamp: new Date().toISOString()
        }
      })
    })
  ]
});

// ================================
// Example: Data Processing Workflow
// ================================

// Create data analysis agent
const analysisAgent = new ComposableAgent({
  name: 'Data Analysis Agent',
  instructions: `
    You are a data analyst. Analyze datasets and provide insights.
    Look for patterns, trends, and anomalies.
    Provide statistical summaries and recommendations.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  tools: {
    processData: createTool({
      id: 'process-data',
      description: 'Process and analyze data',
      inputSchema: z.object({
        data: z.array(z.record(z.any())),
        analysisType: z.string()
      }),
      outputSchema: z.object({
        summary: z.string(),
        insights: z.array(z.string()),
        recommendations: z.array(z.string())
      }),
      execute: async ({ context }) => {
        // Mock data processing
        const { data, analysisType } = context;
        return {
          summary: `Analyzed ${data.length} records using ${analysisType}`,
          insights: ['Trend 1: Increasing pattern', 'Trend 2: Seasonal variation'],
          recommendations: ['Recommendation 1: Optimize process', 'Recommendation 2: Monitor metrics']
        };
      }
    })
  },
  memory: createInMemoryMemory()
});

export const dataProcessingWorkflow = createWorkflow({
  name: 'Data Processing Pipeline',
  description: 'Process, analyze, and generate reports from data',
  initialData: {
    rawData: [
      { date: '2024-01-01', value: 100, category: 'A' },
      { date: '2024-01-02', value: 150, category: 'B' },
      { date: '2024-01-03', value: 120, category: 'A' }
    ]
  },
  steps: [
    // Step 1: Data validation
    createTransformStep({
      id: 'validate-data',
      name: 'Validate Input Data',
      inputSchema: z.object({
        rawData: z.array(z.record(z.any()))
      }),
      transform: (data) => {
        const validRecords = data.rawData.filter((record: any) => 
          record.date && record.value !== undefined
        );
        return {
          validData: validRecords,
          invalidCount: data.rawData.length - validRecords.length
        };
      }
    }),

    // Step 2: Data preprocessing
    createTransformStep({
      id: 'preprocess',
      name: 'Preprocess Data',
      transform: (data) => {
        const processedData = data.validData.map((record: any) => ({
          ...record,
          normalizedValue: record.value / 100,
          timestamp: new Date(record.date).getTime()
        }));
        
        return { processedData };
      }
    }),

    // Step 3: Statistical analysis
    createAgentStep({
      id: 'analyze',
      name: 'Analyze Data',
      agent: analysisAgent,
      messageTemplate: 'Analyze this dataset and provide insights: {{processedData}}',
      outputMapping: {
        'analysis': 'agentResult.message'
      }
    }),

    // Step 4: Generate report
    createTransformStep({
      id: 'generate-report',
      name: 'Generate Final Report',
      transform: (data) => ({
        report: {
          dataQuality: {
            totalRecords: data.rawData?.length || 0,
            validRecords: data.validData?.length || 0,
            invalidRecords: data.invalidCount || 0
          },
          analysis: data.analysis,
          processedAt: new Date().toISOString(),
          recommendations: 'See analysis for detailed recommendations'
        }
      })
    })
  ]
});

// ================================
// Example Usage Functions
// ================================

export async function runContentWorkflowExample() {
  console.log('Running content creation workflow...');
  
  const result = await contentCreationWorkflow.execute();
  
  if (result.success) {
    console.log('Workflow completed successfully!');
    console.log('Final result:', result.data.result);
  } else {
    console.error('Workflow failed:', result.error);
  }
  
  return result;
}

export async function runCustomerSupportExample() {
  console.log('Running customer support workflow...');
  
  const result = await customerSupportWorkflow.execute();
  
  if (result.success) {
    console.log('Support workflow completed!');
    console.log('Response:', result.data.finalResponse);
  } else {
    console.error('Support workflow failed:', result.error);
  }
  
  return result;
}

export async function runDataProcessingExample() {
  console.log('Running data processing workflow...');
  
  const result = await dataProcessingWorkflow.execute();
  
  if (result.success) {
    console.log('Data processing completed!');
    console.log('Report:', result.data.report);
  } else {
    console.error('Data processing failed:', result.error);
  }
  
  return result;
}

// Run all examples
export async function runAllWorkflowExamples() {
  try {
    console.log('=== Running All Workflow Examples ===\n');
    
    await runContentWorkflowExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await runCustomerSupportExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await runDataProcessingExample();
    
    console.log('\n=== All Examples Completed ===');
    
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllWorkflowExamples().catch(console.error);
}
