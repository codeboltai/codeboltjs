/**
 * @fileoverview Example demonstrating CodeBolt backend storage for ComposableAgent
 * @description Shows how to use CodeBolt's state and memory functions instead of SQLite
 */

import { 
  ComposableAgent, 
  createTool,
  createCodeBoltAgentMemory,
  createCodeBoltProjectMemory,
  createCodeBoltDbMemory,
  type ComposableAgentConfig 
} from '../index';
import { z } from 'zod';
import codeboltjs from '@codebolt/codeboltjs';

/**
 * Example: Weather Agent with CodeBolt Agent State Storage
 * Data is stored in CodeBolt's agent state backend
 */
export const weatherAgentWithAgentStorage = new ComposableAgent({
  name: 'Weather Agent',
  instructions: `
    You are a helpful weather assistant that provides accurate weather information.
    Always ask for a location if none is provided.
    Keep responses concise but informative.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  tools: {
    weatherTool: createTool({
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
          conditions: 'Partly cloudy',
          location: context.location
        };
      },
    })
  },
  // Use CodeBolt agent state for memory storage
  memory: createCodeBoltAgentMemory('weather_agent'),
  maxTurns: 10
});

/**
 * Example: Task Management Agent with CodeBolt Project State Storage
 * Data is stored in CodeBolt's project state backend
 */
export const taskAgentWithProjectStorage = new ComposableAgent({
  name: 'Task Manager',
  instructions: `
    You are a task management assistant that helps users organize their work.
    You can create, list, update, and complete tasks.
    Keep track of task status and priorities.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  tools: {
    createTaskTool: createTool({
      id: 'create-task',
      description: 'Create a new task',
      inputSchema: z.object({
        title: z.string().describe('Task title'),
        description: z.string().optional().describe('Task description'),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
      }),
      outputSchema: z.object({
        taskId: z.string(),
        title: z.string(),
        status: z.string(),
      }),
      execute: async ({ context }: any) => {
        const taskId = `task_${Date.now()}`;
        return {
          taskId,
          title: context.title,
          status: 'created'
        };
      },
    })
  },
  // Use CodeBolt project state for memory storage
  memory: createCodeBoltProjectMemory('task_agent'),
  maxTurns: 15
});

/**
 * Example: Knowledge Agent with CodeBolt Memory Database Storage
 * Data is stored in CodeBolt's in-memory database backend
 */
export const knowledgeAgentWithDbStorage = new ComposableAgent({
  name: 'Knowledge Assistant',
  instructions: `
    You are a knowledge management assistant that helps users store and retrieve information.
    You can save facts, remember conversations, and answer questions based on stored knowledge.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  tools: {
    saveKnowledgeTool: createTool({
      id: 'save-knowledge',
      description: 'Save a piece of knowledge',
      inputSchema: z.object({
        topic: z.string().describe('Knowledge topic'),
        content: z.string().describe('Knowledge content'),
        tags: z.array(z.string()).optional().describe('Optional tags'),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        knowledgeId: z.string(),
      }),
      execute: async ({ context }: any) => {
        const knowledgeId = `knowledge_${Date.now()}`;
        return {
          success: true,
          knowledgeId
        };
      },
    })
  },
  // Use CodeBolt memory database for storage
  memory: createCodeBoltDbMemory('knowledge_agent'),
  maxTurns: 20
});

/**
 * Example usage within CodeBolt onMessage
 */
export function setupCodeBoltStorageExample() {
  codeboltjs.onMessage(async (reqMessage) => {
    try {
      // Example 1: Weather agent with agent state storage
      if (reqMessage.userMessage.includes('weather')) {
        const result = await weatherAgentWithAgentStorage.run();
        return result.message;
      }
      
      // Example 2: Task agent with project state storage
      if (reqMessage.userMessage.includes('task')) {
        const result = await taskAgentWithProjectStorage.run();
        return result.message;
      }
      
      // Example 3: Knowledge agent with memory database storage
      if (reqMessage.userMessage.includes('knowledge') || reqMessage.userMessage.includes('remember')) {
        const result = await knowledgeAgentWithDbStorage.run();
        return result.message;
      }
      
      return 'Please specify what you need help with: weather, tasks, or knowledge management.';
    } catch (error) {
      console.error('Agent execution error:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  });
}

/**
 * Example: Custom storage configuration
 */
export function createCustomStorageAgent() {
  return new ComposableAgent({
    name: 'Custom Storage Agent',
    instructions: 'I use custom storage prefixes to avoid conflicts.',
    model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
    // Use custom prefix to avoid storage conflicts
    memory: createCodeBoltAgentMemory('my_app_agent_v2'),
    maxTurns: 10
  });
}

/**
 * Example: Multiple agents with different storage backends
 */
export function setupMultiStorageAgents() {
  const sessionAgent = new ComposableAgent({
    name: 'Session Agent',
    instructions: 'I handle session-specific data.',
    model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
    // Session data stored in agent state
    memory: createCodeBoltAgentMemory('session'),
  });

  const globalAgent = new ComposableAgent({
    name: 'Global Agent',
    instructions: 'I handle project-wide data.',
    model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
    // Global data stored in project state
    memory: createCodeBoltProjectMemory('global'),
  });

  const cacheAgent = new ComposableAgent({
    name: 'Cache Agent',
    instructions: 'I handle temporary cached data.',
    model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
    // Cache data stored in memory database
    memory: createCodeBoltDbMemory('cache'),
  });

  return { sessionAgent, globalAgent, cacheAgent };
}

/**
 * Storage comparison and migration helper
 */
export async function storageComparison() {
  console.log('=== CodeBolt Storage Options ===');
  
  console.log('1. Agent State Storage:');
  console.log('   - Persisted across agent sessions');
  console.log('   - Scoped to agent/user context');
  console.log('   - Best for: User preferences, agent settings');
  
  console.log('2. Project State Storage:');
  console.log('   - Persisted across project sessions');
  console.log('   - Scoped to current project');
  console.log('   - Best for: Project-specific data, global settings');
  
  console.log('3. Memory Database Storage:');
  console.log('   - Fast in-memory access');
  console.log('   - May not persist across restarts');
  console.log('   - Best for: Temporary data, caching, session data');
  
  console.log('4. Migration from SQLite:');
  console.log('   - No need for external database dependencies');
  console.log('   - Seamless integration with CodeBolt ecosystem');
  console.log('   - Automatic backup and sync (if supported by CodeBolt)');
}
