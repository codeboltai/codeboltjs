/**
 * @fileoverview Custom Step Creation Examples
 * @description Examples showing how to create custom workflow steps with your own logic
 */

import { 
  createWorkflow,
  createStep,
  createSimpleStep,
  createAsyncStep,
  createValidationStep,
  createLoggingStep,
  z
} from '../index';

// ================================
// Basic Custom Step Examples
// ================================

/**
 * Example: Simple math calculation step
 */
const mathStep = createSimpleStep({
  id: 'calculate-total',
  name: 'Calculate Order Total',
  description: 'Calculate total price with tax and shipping',
  inputSchema: z.object({
    items: z.array(z.object({
      price: z.number(),
      quantity: z.number()
    })),
    taxRate: z.number().default(0.08),
    shippingCost: z.number().default(10)
  }),
  execute: (data) => {
    const subtotal = data.items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const tax = subtotal * data.taxRate;
    const total = subtotal + tax + data.shippingCost;
    
    return {
      subtotal,
      tax,
      shipping: data.shippingCost,
      total,
      itemCount: data.items.length
    };
  }
});

/**
 * Example: String processing step
 */
const textProcessingStep = createSimpleStep({
  id: 'process-text',
  name: 'Process Text Data',
  execute: (data) => {
    const text = data.rawText || '';
    
    return {
      processedText: text.toLowerCase().trim(),
      wordCount: text.split(/\s+/).filter((w: string) => w.length > 0).length,
      characterCount: text.length,
      sentences: text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0).length,
      containsEmail: /\S+@\S+\.\S+/.test(text),
      containsPhone: /\d{3}-\d{3}-\d{4}/.test(text)
    };
  }
});

/**
 * Example: Async API call step
 */
const fetchDataStep = createAsyncStep({
  id: 'fetch-user-data',
  name: 'Fetch User Information',
  description: 'Fetch user data from external API',
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential'
  },
  execute: async (data, context) => {
    // Simulate API call
    const userId = data.userId;
    
    // Mock API response (in real usage, this would be an actual fetch call)
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const userData = {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      preferences: {
        theme: 'dark',
        notifications: true
      },
      lastLogin: new Date().toISOString()
    };
    
    return { userData };
  }
});

/**
 * Example: Advanced custom step with full control
 */
const advancedProcessingStep = createStep({
  id: 'advanced-processing',
  name: 'Advanced Data Processing',
  description: 'Complex data processing with validation and error handling',
  inputSchema: z.object({
    dataset: z.array(z.record(z.any())),
    processingOptions: z.object({
      filterBy: z.string().optional(),
      sortBy: z.string().optional(),
      groupBy: z.string().optional()
    }).optional()
  }),
  execute: async (context) => {
    const { dataset, processingOptions = {} } = context.data;
    
    try {
      let processedData = [...dataset];
      
      // Apply filtering
      if (processingOptions.filterBy) {
        processedData = processedData.filter(item => 
          item[processingOptions.filterBy] !== undefined
        );
      }
      
      // Apply sorting
      if (processingOptions.sortBy) {
        processedData.sort((a, b) => {
          const aVal = a[processingOptions.sortBy!];
          const bVal = b[processingOptions.sortBy!];
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
      }
      
      // Apply grouping
      let groupedData = null;
      if (processingOptions.groupBy) {
        groupedData = processedData.reduce((groups, item) => {
          const key = item[processingOptions.groupBy!];
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
          return groups;
        }, {} as Record<string, any[]>);
      }
      
      return {
        stepId: 'advanced-processing',
        success: true,
        output: {
          processedData,
          groupedData,
          statistics: {
            originalCount: dataset.length,
            processedCount: processedData.length,
            processingOptions
          }
        },
        executionTime: 0
      };
      
    } catch (error) {
      return {
        stepId: 'advanced-processing',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0
      };
    }
  }
});

/**
 * Example: Conditional step based on data
 */
const conditionalStep = createStep({
  id: 'conditional-logic',
  name: 'Conditional Processing',
  condition: (context) => context.data.shouldProcess === true,
  execute: async (context) => {
    const processingType = context.data.processingType || 'default';
    
    let result;
    switch (processingType) {
      case 'fast':
        result = { processed: true, method: 'fast', duration: 100 };
        break;
      case 'thorough':
        result = { processed: true, method: 'thorough', duration: 500 };
        break;
      default:
        result = { processed: true, method: 'default', duration: 200 };
    }
    
    return {
      stepId: 'conditional-logic',
      success: true,
      output: result,
      executionTime: 0
    };
  }
});

// ================================
// Workflow Examples Using Custom Steps
// ================================

/**
 * E-commerce order processing workflow
 */
export const orderProcessingWorkflow = createWorkflow({
  name: 'Order Processing Pipeline',
  description: 'Process e-commerce orders with calculations, validation, and data fetching',
  initialData: {
    orderId: 'ORD-12345',
    userId: 'USER-789',
    items: [
      { price: 29.99, quantity: 2 },
      { price: 15.50, quantity: 1 }
    ],
    taxRate: 0.08,
    shippingCost: 10
  },
  steps: [
    // Step 1: Log the start
    createLoggingStep({
      id: 'log-start',
      name: 'Log Order Start',
      level: 'info',
      message: 'Starting order processing',
      fields: ['orderId', 'userId']
    }),
    
    // Step 2: Validate order data
    createValidationStep({
      id: 'validate-order',
      name: 'Validate Order',
      schema: z.object({
        orderId: z.string(),
        userId: z.string(),
        items: z.array(z.object({
          price: z.number().positive(),
          quantity: z.number().int().positive()
        })).min(1)
      }),
      stopOnFailure: true
    }),
    
    // Step 3: Calculate totals
    mathStep,
    
    // Step 4: Fetch user data (parallel with calculations)
    fetchDataStep,
    
    // Step 5: Process order summary
    createSimpleStep({
      id: 'create-summary',
      name: 'Create Order Summary',
      dependencies: ['calculate-total', 'fetch-user-data'],
      execute: (data) => ({
        orderSummary: {
          orderId: data.orderId,
          customer: data.userData,
          billing: {
            subtotal: data.subtotal,
            tax: data.tax,
            shipping: data.shipping,
            total: data.total
          },
          items: data.items,
          processedAt: new Date().toISOString()
        }
      })
    }),
    
    // Step 6: Log completion
    createLoggingStep({
      id: 'log-completion',
      name: 'Log Order Completion',
      level: 'info',
      message: 'Order processing completed',
      fields: ['orderId', 'total']
    })
  ]
});

/**
 * Data analysis workflow
 */
export const dataAnalysisWorkflow = createWorkflow({
  name: 'Data Analysis Pipeline',
  description: 'Analyze dataset with preprocessing, validation, and statistics',
  initialData: {
    dataset: [
      { id: 1, name: 'Alice', age: 25, department: 'Engineering' },
      { id: 2, name: 'Bob', age: 30, department: 'Marketing' },
      { id: 3, name: 'Charlie', age: 35, department: 'Engineering' },
      { id: 4, name: 'Diana', age: 28, department: 'Sales' }
    ],
    processingOptions: {
      sortBy: 'age',
      groupBy: 'department'
    }
  },
  steps: [
    // Step 1: Validate dataset
    createValidationStep({
      id: 'validate-dataset',
      name: 'Validate Dataset',
      field: 'dataset',
      schema: z.array(z.object({
        id: z.number(),
        name: z.string(),
        age: z.number(),
        department: z.string()
      })).min(1)
    }),
    
    // Step 2: Advanced processing
    advancedProcessingStep,
    
    // Step 3: Calculate statistics
    createSimpleStep({
      id: 'calculate-stats',
      name: 'Calculate Statistics',
      execute: (data) => {
        const dataset = data.processedData;
        const ages = dataset.map((item: any) => item.age);
        
        return {
          statistics: {
            totalRecords: dataset.length,
            averageAge: ages.reduce((sum: number, age: number) => sum + age, 0) / ages.length,
            minAge: Math.min(...ages),
            maxAge: Math.max(...ages),
            departments: [...new Set(dataset.map((item: any) => item.department))],
            groupSizes: Object.entries(data.groupedData || {}).map(([dept, items]) => ({
              department: dept,
              count: (items as any[]).length
            }))
          }
        };
      }
    }),
    
    // Step 4: Generate report
    createSimpleStep({
      id: 'generate-report',
      name: 'Generate Analysis Report',
      execute: (data) => ({
        report: {
          summary: `Analyzed ${data.statistics.totalRecords} records`,
          demographics: {
            averageAge: data.statistics.averageAge,
            ageRange: `${data.statistics.minAge} - ${data.statistics.maxAge}`
          },
          departments: data.statistics.departments,
          groupBreakdown: data.statistics.groupSizes,
          generatedAt: new Date().toISOString()
        }
      })
    })
  ]
});

/**
 * Text processing workflow
 */
export const textProcessingWorkflow = createWorkflow({
  name: 'Text Processing Pipeline',
  description: 'Process and analyze text content',
  initialData: {
    rawText: `
      Hello! My name is John Doe. You can reach me at john.doe@example.com 
      or call me at 555-123-4567. I'm excited to work with your team on this 
      new project. We have three main goals: improve efficiency, reduce costs, 
      and enhance user experience.
    `,
    shouldProcess: true,
    processingType: 'thorough'
  },
  steps: [
    // Step 1: Basic text processing
    textProcessingStep,
    
    // Step 2: Conditional advanced processing
    conditionalStep,
    
    // Step 3: Extract entities
    createSimpleStep({
      id: 'extract-entities',
      name: 'Extract Entities',
      execute: (data) => {
        const text = data.processedText || data.rawText;
        
        // Simple entity extraction (in real usage, you might use NLP libraries)
        const emails = text.match(/\S+@\S+\.\S+/g) || [];
        const phones = text.match(/\d{3}-\d{3}-\d{4}/g) || [];
        const names = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/g) || [];
        
        return {
          entities: {
            emails,
            phones,
            names,
            total: emails.length + phones.length + names.length
          }
        };
      }
    }),
    
    // Step 4: Create analysis summary
    createSimpleStep({
      id: 'create-text-summary',
      name: 'Create Text Analysis Summary',
      execute: (data) => ({
        textAnalysis: {
          content: {
            wordCount: data.wordCount,
            characterCount: data.characterCount,
            sentences: data.sentences
          },
          entities: data.entities,
          processingMethod: data.method || 'none',
          containsPersonalInfo: data.containsEmail || data.containsPhone,
          analysisScore: Math.min(10, (data.wordCount / 10) + data.entities.total)
        }
      })
    })
  ]
});

// ================================
// Example Usage Functions
// ================================

export async function runOrderProcessingExample() {
  console.log('Running order processing workflow...');
  
  const result = await orderProcessingWorkflow.execute();
  
  if (result.success) {
    console.log('Order processed successfully!');
    console.log('Order summary:', result.data.orderSummary);
  } else {
    console.error('Order processing failed:', result.error);
  }
  
  return result;
}

export async function runDataAnalysisExample() {
  console.log('Running data analysis workflow...');
  
  const result = await dataAnalysisWorkflow.execute();
  
  if (result.success) {
    console.log('Data analysis completed!');
    console.log('Report:', result.data.report);
  } else {
    console.error('Data analysis failed:', result.error);
  }
  
  return result;
}

export async function runTextProcessingExample() {
  console.log('Running text processing workflow...');
  
  const result = await textProcessingWorkflow.execute();
  
  if (result.success) {
    console.log('Text processing completed!');
    console.log('Analysis:', result.data.textAnalysis);
  } else {
    console.error('Text processing failed:', result.error);
  }
  
  return result;
}

// Run all examples
export async function runAllCustomStepExamples() {
  try {
    console.log('=== Running All Custom Step Examples ===\n');
    
    await runOrderProcessingExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await runDataAnalysisExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await runTextProcessingExample();
    
    console.log('\n=== All Custom Step Examples Completed ===');
    
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllCustomStepExamples().catch(console.error);
}
