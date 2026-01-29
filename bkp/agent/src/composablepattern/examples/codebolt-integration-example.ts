/**
 * @fileoverview CodeBolt Integration Example
 * @description Example showing how to use ComposableAgent within CodeBolt's onMessage system
 */

import { 
  ComposableAgent, 
  createTool, 
  saveUserMessage,
  getUserMessage,
  getMentionedFiles,
  getMentionedMCPs,
  z 
} from '../index';

// This would typically be in a separate file, e.g., agent.js
const codebolt = require('@codebolt/codeboltjs');

// Create your tools
const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    // Mock weather data
    return {
      temperature: 22,
      conditions: 'Sunny',
      location: context.location
    };
  },
});

// Create your composable agent
const myAgent = new ComposableAgent({
  name: 'Weather Assistant',
  instructions: `
    You are a helpful weather assistant. 
    Use the weather tool to get current weather information.
    Be friendly and provide helpful responses.
  `,
  model: 'weathermodel', // References configuration in codeboltagents.yaml
  tools: { weatherTool },
  processing: {
    // Configure what to process automatically
    processMentionedMCPs: true,    // Auto-add mentioned MCPs as tools
    processRemixPrompt: true,      // Use remix prompt to enhance instructions
    processMentionedFiles: true,   // Include mentioned file contents
    processMentionedAgents: true   // Add mentioned agents as sub-agents
  }
});

// CodeBolt integration - this is how you'd use it in your agent
codebolt.onMessage(async (reqMessage: any) => {
  try {
    console.log('Received message:', reqMessage);

    // Save the user message globally so the agent can access it
    saveUserMessage(reqMessage, {
      // You can override the auto-detection here if needed
      processMentionedMCPs: true,
      processRemixPrompt: true,
      processMentionedFiles: false, // Don't process files for this agent
      processMentionedAgents: true
    });

    // Now simply run the agent - it will automatically use the saved user context
    const result = await myAgent.run();

    if (result.success) {
      return result.message;
    } else {
      console.error('Agent failed:', result.error);
      return 'Sorry, I encountered an error processing your request.';
    }

  } catch (error) {
    console.error('Error in agent execution:', error);
    return 'Sorry, something went wrong.';
  }
});

// ================================
// Alternative Example: Manual Configuration per Message
// ================================

const flexibleAgent = new ComposableAgent({
  name: 'Flexible Assistant',
  instructions: 'I am a flexible assistant that adapts based on user context.',
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  tools: { weatherTool }
  // No processing config - will use global user config
});

codebolt.onMessage(async (reqMessage: any) => {
  try {
    // Analyze the message to determine what to process
    const shouldProcessMCPs = reqMessage.mentionedMCPs?.length > 0;
    const shouldProcessFiles = reqMessage.mentionedFiles?.some((file: string) => 
      file.endsWith('.json') || file.endsWith('.yaml')
    );

    // Save with custom configuration
    saveUserMessage(reqMessage, {
      processMentionedMCPs: shouldProcessMCPs,
      processRemixPrompt: true,
      processMentionedFiles: shouldProcessFiles,
      processMentionedAgents: false // Don't use sub-agents for this example
    });

    // Run the agent
    const result = await flexibleAgent.run();

    return result.success ? result.message : 'Error occurred';

  } catch (error) {
    console.error('Error:', error);
    return 'Error processing request';
  }
});

// ================================
// Example: Multiple Agents with Shared Context
// ================================

const researchAgent = new ComposableAgent({
  name: 'Research Agent',
  instructions: 'Research and gather information on topics.',
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  processing: { processMentionedFiles: true } // This agent processes files
});

const writingAgent = new ComposableAgent({
  name: 'Writing Agent',
  instructions: 'Write content based on research and requirements.',
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  processing: { processRemixPrompt: true } // This agent uses remix prompts
});

codebolt.onMessage(async (reqMessage: any) => {
  try {
    // Save user message once for all agents to use
    saveUserMessage(reqMessage);

    let result;

    // Determine which agent to use based on message content
    if (reqMessage.userMessage.toLowerCase().includes('research')) {
      result = await researchAgent.run();
    } else if (reqMessage.userMessage.toLowerCase().includes('write')) {
      result = await writingAgent.run();
    } else {
      // Use the default agent
      result = await myAgent.run();
    }

    return result.success ? result.message : 'Error occurred';

  } catch (error) {
    console.error('Error:', error);
    return 'Error processing request';
  }
});

// ================================
// Example: Workflow with Global Context
// ================================

import { 
  createWorkflow, 
  createAgentStep, 
  createSimpleStep 
} from '../index';

const workflowAgent = new ComposableAgent({
  name: 'Workflow Agent',
  instructions: 'I coordinate complex multi-step tasks.',
  model: 'gpt-4o-mini' // References configuration in codeboltagents.yaml
});

const complexWorkflow = createWorkflow({
  name: 'Research and Write Workflow',
  initialData: {}, // Will be populated from user context
  steps: [
    // Extract user context into workflow data
    createSimpleStep({
      id: 'setup-context',
      name: 'Setup Workflow Context',
      execute: () => {
        const userMsg = getUserMessage();
        const files = getMentionedFiles();
        const mcps = getMentionedMCPs();
        
        return {
          userMessage: userMsg?.userMessage || '',
          mentionedFiles: files,
          mentionedMCPs: mcps,
          setupComplete: true
        };
      }
    }),

    // Use agent step that automatically gets user context
    createAgentStep({
      id: 'research-step',
      name: 'Research Phase',
      agent: researchAgent,
      messageTemplate: 'Research this topic: {{userMessage}}',
      outputMapping: { 'researchData': 'agentResult.message' }
    }),

    createAgentStep({
      id: 'writing-step',
      name: 'Writing Phase',
      agent: writingAgent,
      messageTemplate: 'Write content based on: {{researchData}}',
      outputMapping: { 'finalContent': 'agentResult.message' }
    })
  ]
});

codebolt.onMessage(async (reqMessage: any) => {
  try {
    // Save user message for all agents and workflow steps to use
    saveUserMessage(reqMessage);

    if (reqMessage.userMessage.includes('complex task')) {
      // Use workflow for complex tasks
      const workflowResult = await complexWorkflow.execute();
      return workflowResult.success ? workflowResult.data.finalContent : 'Workflow failed';
    } else {
      // Use simple agent for regular tasks
      const result = await workflowAgent.run();
      return result.success ? result.message : 'Agent failed';
    }

  } catch (error) {
    console.error('Error:', error);
    return 'Error processing request';
  }
});

// Export examples for testing
export {
  myAgent,
  flexibleAgent,
  researchAgent,
  writingAgent,
  workflowAgent,
  complexWorkflow
};
