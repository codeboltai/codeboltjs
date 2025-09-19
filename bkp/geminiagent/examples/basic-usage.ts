/**
 * Basic Usage Examples for Gemini Agent with Unified Framework
 * 
 * This file demonstrates how to use the migrated Gemini agent
 * with the new unified framework.
 */

import { geminiAgent, executeGeminiAgent, getGeminiAgentStatus } from '../src/index';

// ================================
// Example 1: Basic Agent Execution
// ================================

async function basicUsageExample() {
    console.log('=== Basic Usage Example ===');
    
    try {
        // Simple message execution
        const result = await executeGeminiAgent('Hello! Can you help me understand my project structure?');
        
        console.log('Agent Response:', {
            success: result.success,
            response: result.response?.substring(0, 200) + '...',
            iterations: result.iterations,
            toolsUsed: result.toolResults?.length || 0,
            executionTime: result.executionTime
        });
        
    } catch (error) {
        console.error('Basic usage failed:', error);
    }
}

// ================================
// Example 2: File Operations
// ================================

async function fileOperationsExample() {
    console.log('\n=== File Operations Example ===');
    
    try {
        // Read a file
        const readResult = await executeGeminiAgent('Read the package.json file and tell me about the project dependencies');
        console.log('File read result:', readResult.success);
        
        // Create a file
        const createResult = await executeGeminiAgent('Create a simple README.md file with basic project information');
        console.log('File create result:', createResult.success);
        
        // List files
        const listResult = await executeGeminiAgent('List all TypeScript files in the src directory');
        console.log('File list result:', listResult.success);
        
    } catch (error) {
        console.error('File operations failed:', error);
    }
}

// ================================
// Example 3: Web Content Processing
// ================================

async function webContentExample() {
    console.log('\n=== Web Content Processing Example ===');
    
    try {
        // Process URL content
        const result = await executeGeminiAgent(
            'Summarize the main points from this documentation: https://docs.example.com/api'
        );
        
        console.log('Web content processing:', {
            success: result.success,
            hasResponse: !!result.response,
            toolsUsed: result.toolResults?.length || 0
        });
        
    } catch (error) {
        console.error('Web content processing failed:', error);
    }
}

// ================================
// Example 4: Advanced Configuration
// ================================

async function advancedConfigurationExample() {
    console.log('\n=== Advanced Configuration Example ===');
    
    try {
        // Execute with custom context and options
        const result = await executeGeminiAgent(
            'Analyze the code quality of my TypeScript files and suggest improvements',
            {
                maxIterations: 8,
                includeHistory: true,
                context: {
                    projectType: 'web-application',
                    language: 'typescript',
                    framework: 'react',
                    analysisDepth: 'comprehensive'
                }
            }
        );
        
        console.log('Advanced execution:', {
            success: result.success,
            iterations: result.iterations,
            conversationLength: result.conversationHistory?.length || 0,
            toolsExecuted: result.toolResults?.length || 0
        });
        
    } catch (error) {
        console.error('Advanced configuration failed:', error);
    }
}

// ================================
// Example 5: Agent Status and Monitoring
// ================================

async function monitoringExample() {
    console.log('\n=== Monitoring Example ===');
    
    try {
        // Get agent status
        const status = getGeminiAgentStatus();
        console.log('Agent Status:', status);
        
        // Execute with monitoring
        const startTime = Date.now();
        const result = await executeGeminiAgent('Help me optimize my code for better performance');
        const endTime = Date.now();
        
        console.log('Execution Metrics:', {
            totalTime: endTime - startTime,
            agentExecutionTime: result.executionTime,
            success: result.success,
            iterations: result.iterations,
            efficiency: result.executionTime / (endTime - startTime)
        });
        
    } catch (error) {
        console.error('Monitoring example failed:', error);
    }
}

// ================================
// Example 6: Error Handling
// ================================

async function errorHandlingExample() {
    console.log('\n=== Error Handling Example ===');
    
    try {
        // Intentionally problematic request
        const result = await executeGeminiAgent('', { // Empty message
            maxIterations: 1
        });
        
        if (!result.success) {
            console.log('Handled error gracefully:', {
                error: result.error,
                hasResponse: !!result.response
            });
        }
        
    } catch (error) {
        console.log('Caught unexpected error:', error instanceof Error ? error.message : String(error));
    }
}

// ================================
// Example 7: Direct Agent Usage
// ================================

async function directAgentUsageExample() {
    console.log('\n=== Direct Agent Usage Example ===');
    
    try {
        // Use the agent instance directly
        const result = await geminiAgent.execute('What tools do you have available?', {
            maxIterations: 3,
            context: {
                requestType: 'tool-inquiry',
                verbose: true
            }
        });
        
        console.log('Direct agent usage:', {
            success: result.success,
            toolsListed: result.response?.includes('FileReadTool'),
            responseLength: result.response?.length || 0
        });
        
        // Get agent tools
        const tools = geminiAgent.listTools();
        console.log('Available tools:', tools.map(tool => tool.function.name));
        
    } catch (error) {
        console.error('Direct agent usage failed:', error);
    }
}

// ================================
// Run All Examples
// ================================

export async function runAllExamples() {
    console.log('🚀 Running Gemini Agent Examples with Unified Framework\n');
    
    try {
        await basicUsageExample();
        await fileOperationsExample();
        await webContentExample();
        await advancedConfigurationExample();
        await monitoringExample();
        await errorHandlingExample();
        await directAgentUsageExample();
        
        console.log('\n✅ All examples completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Examples failed:', error);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples();
}

// Export individual examples for selective testing
export {
    basicUsageExample,
    fileOperationsExample,
    webContentExample,
    advancedConfigurationExample,
    monitoringExample,
    errorHandlingExample,
    directAgentUsageExample
};
