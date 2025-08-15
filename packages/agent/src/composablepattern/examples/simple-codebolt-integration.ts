/**
 * @fileoverview Simple CodeBolt Integration Example
 * @description Shows the new simplified integration where codeboltjs automatically saves user messages
 */

// This is how simple it now is - no manual saveUserMessage needed!

const codebolt = require('@codebolt/codeboltjs');
const { ComposableAgent, createTool, z } = require('@codebolt/agent/composable');

// Create a simple tool
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
  execute: async ({ context }: any) => {
    // Mock weather data
    return {
      temperature: 22,
      conditions: 'Sunny',
      location: context.location
    };
  },
});

// Create your agent
const myAgent = new ComposableAgent({
  name: 'Weather Assistant',
  instructions: `
    You are a helpful weather assistant. 
    Use the weather tool to get current weather information.
    Be friendly and provide helpful responses.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  tools: { weatherTool },
  processing: {
    processMentionedMCPs: true,    // Auto-add mentioned MCPs as tools
    processRemixPrompt: true,      // Use remix prompt to enhance instructions
    processMentionedFiles: true,   // Include mentioned file contents
    processMentionedAgents: true   // Add mentioned agents as sub-agents
  }
});

// Simple CodeBolt integration - no manual saveUserMessage needed!
codebolt.onMessage(async (reqMessage: any) => {
  try {
    // codeboltjs automatically saves the user message now!
    // You can access it anytime with codebolt.userMessage.*
    
    console.log('Current message:', codebolt.userMessage.getText());
    console.log('Mentioned files:', codebolt.userMessage.getMentionedFiles());
    console.log('Mentioned MCPs:', codebolt.userMessage.getMentionedMCPs());
    
    // Just run the agent - it automatically gets the user context
    const result = await myAgent.run();
    
    return result.success ? result.message : 'Error occurred';
    
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, something went wrong.';
  }
});

// Example: Multiple agents sharing the same user context
const researchAgent = new ComposableAgent({
  name: 'Research Agent',
  instructions: 'Research topics and provide detailed information.',
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  processing: { processMentionedFiles: true }
});

const writingAgent = new ComposableAgent({
  name: 'Writing Agent',
  instructions: 'Write content based on research and requirements.',
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  processing: { processRemixPrompt: true }
});

// Alternative onMessage handler using multiple agents
codebolt.onMessage(async (reqMessage: any) => {
  try {
    // Access user context directly from codebolt
    const messageText = codebolt.userMessage.getText().toLowerCase();
    const hasFiles = codebolt.userMessage.getMentionedFiles().length > 0;
    const hasRemixPrompt = !!codebolt.userMessage.getRemixPrompt();
    
    let result;
    
    if (messageText.includes('research') || hasFiles) {
      result = await researchAgent.run();
    } else if (messageText.includes('write') || hasRemixPrompt) {
      result = await writingAgent.run();
    } else {
      result = await myAgent.run();
    }
    
    return result.success ? result.message : 'Error occurred';
    
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, something went wrong.';
  }
});

// Example: Using session data for state management
codebolt.onMessage(async (reqMessage: any) => {
  try {
    // Store conversation state
    const conversationId = codebolt.userMessage.getThreadId() || 'default';
    const userId = codebolt.userMessage.getMessageId() || 'anonymous';
    
    // Set session data
    codebolt.userMessage.setSessionData('conversationId', conversationId);
    codebolt.userMessage.setSessionData('userId', userId);
    
    // Configure processing based on user preferences (could be stored in DB)
    if (userId === 'power-user') {
      codebolt.userMessage.updateProcessingConfig({
        processMentionedMCPs: true,
        processMentionedFiles: true,
        processRemixPrompt: true,
        processMentionedAgents: true
      });
    }
    
    const result = await myAgent.run();
    
    // Store result for conversation continuity
    codebolt.userMessage.setSessionData('lastResult', result.message);
    
    return result.message;
    
  } catch (error) {
    console.error('Error:', error);
    return 'Error processing request';
  }
});

// Example: Conditional processing based on message content
codebolt.onMessage(async (reqMessage: any) => {
  try {
    const files = codebolt.userMessage.getMentionedFiles();
    const mcps = codebolt.userMessage.getMentionedMCPs();
    
    // Conditionally update processing config
    if (files.some(f => f.endsWith('.env') || f.endsWith('.secret'))) {
      // Don't process sensitive files
      codebolt.userMessage.updateProcessingConfig({
        processMentionedFiles: false
      });
    }
    
    if (mcps.some(mcp => mcp.toolbox === 'admin')) {
      // Only process admin MCPs for authorized users
      const isAdmin = checkUserPermissions(codebolt.userMessage.getMessageId());
      codebolt.userMessage.updateProcessingConfig({
        processMentionedMCPs: isAdmin
      });
    }
    
    const result = await myAgent.run();
    return result.message;
    
  } catch (error) {
    console.error('Error:', error);
    return 'Error processing request';
  }
});

function checkUserPermissions(userId: string): boolean {
  // Mock permission check
  return userId === 'admin-user';
}

// Export for testing
export {
  myAgent,
  researchAgent,
  writingAgent
};
