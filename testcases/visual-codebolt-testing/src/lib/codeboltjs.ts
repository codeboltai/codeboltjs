// Environment configuration
const CODEBOLT_CONFIG = {
  threadToken: process.env.NEXT_PUBLIC_THREAD_TOKEN || 'c6a4f8dc-b017-4a11-b8d0-4caaecc3c6c1',
  agentId: process.env.NEXT_PUBLIC_AGENT_ID || '03ad0d21-738b-4b55-8ba5-ea8c39d3c539',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
};

// Module interface definitions
export interface CodeboltModule {
  name: string;
  description: string;
  functions: CodeboltFunction[];
}

export interface CodeboltFunction {
  name: string;
  description: string;
  parameters: CodeboltParameter[];
  returnType: string;
}

export interface CodeboltParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  default?: any;
}

// Available modules configuration
export const CODEBOLT_MODULES: CodeboltModule[] = [
  {
    name: 'File System',
    description: 'File system operations',
    functions: [
      {
        name: 'createFile',
        description: 'Create a new file',
        parameters: [
          { name: 'fileName', type: 'string', required: true, description: 'Name of the file' },
          { name: 'source', type: 'string', required: true, description: 'File content' },
          { name: 'filePath', type: 'string', required: true, description: 'Path where to create the file' },
        ],
        returnType: 'CreateFileResponse',
      },
      {
        name: 'readFile',
        description: 'Read file contents',
        parameters: [
          { name: 'filePath', type: 'string', required: true, description: 'Path to the file' },
        ],
        returnType: 'ReadFileResponse',
      },
      {
        name: 'updateFile',
        description: 'Update file contents',
        parameters: [
          { name: 'filePath', type: 'string', required: true, description: 'Path to the file' },
          { name: 'content', type: 'string', required: true, description: 'New file content' },
        ],
        returnType: 'UpdateFileResponse',
      },
      {
        name: 'deleteFile',
        description: 'Delete a file',
        parameters: [
          { name: 'filePath', type: 'string', required: true, description: 'Path to the file' },
        ],
        returnType: 'DeleteFileResponse',
      },
      {
        name: 'searchFiles',
        description: 'Search for files',
        parameters: [
          { name: 'pattern', type: 'string', required: true, description: 'Search pattern' },
          { name: 'directory', type: 'string', required: false, description: 'Directory to search in' },
        ],
        returnType: 'SearchFilesResponse',
      },
    ],
  },
  {
    name: 'Chat',
    description: 'Chat and messaging operations',
    functions: [
      {
        name: 'getChatHistory',
        description: 'Get chat history',
        parameters: [
          { name: 'threadId', type: 'string', required: true, description: 'Thread ID' },
        ],
        returnType: 'ChatMessage[]',
      },
      {
        name: 'sendMessage',
        description: 'Send a message',
        parameters: [
          { name: 'message', type: 'string', required: true, description: 'Message content' },
          { name: 'threadId', type: 'string', required: false, description: 'Thread ID' },
        ],
        returnType: 'ChatResponse',
      },
    ],
  },
  {
    name: 'Action Plan',
    description: 'Action plan management',
    functions: [
      {
        name: 'getAllPlans',
        description: 'Get all action plans',
        parameters: [],
        returnType: 'ActionPlan[]',
      },
      {
        name: 'getPlanDetail',
        description: 'Get action plan details',
        parameters: [
          { name: 'planId', type: 'string', required: true, description: 'Plan ID' },
        ],
        returnType: 'ActionPlanDetail',
      },
      {
        name: 'createActionPlan',
        description: 'Create a new action plan',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'Plan name' },
          { name: 'description', type: 'string', required: false, description: 'Plan description' },
          { name: 'agentId', type: 'string', required: false, description: 'Agent ID' },
        ],
        returnType: 'ActionPlan',
      },
      {
        name: 'addTaskToActionPlan',
        description: 'Add task to action plan',
        parameters: [
          { name: 'planId', type: 'string', required: true, description: 'Plan ID' },
          { name: 'task', type: 'object', required: true, description: 'Task object' },
        ],
        returnType: 'ActionPlan',
      },
      {
        name: 'startTaskStep',
        description: 'Start a task step',
        parameters: [
          { name: 'planId', type: 'string', required: true, description: 'Plan ID' },
          { name: 'taskId', type: 'string', required: true, description: 'Task ID' },
        ],
        returnType: 'TaskStepResponse',
      },
    ],
  },
  {
    name: 'Terminal',
    description: 'Terminal command execution',
    functions: [
      {
        name: 'executeCommand',
        description: 'Execute terminal command',
        parameters: [
          { name: 'command', type: 'string', required: true, description: 'Command to execute' },
          { name: 'cwd', type: 'string', required: false, description: 'Working directory' },
        ],
        returnType: 'TerminalResponse',
      },
    ],
  },
  {
    name: 'Browser',
    description: 'Browser automation',
    functions: [
      {
        name: 'navigate',
        description: 'Navigate to URL',
        parameters: [
          { name: 'url', type: 'string', required: true, description: 'URL to navigate to' },
        ],
        returnType: 'NavigationResponse',
      },
      {
        name: 'screenshot',
        description: 'Take screenshot',
        parameters: [
          { name: 'format', type: 'string', required: false, description: 'Image format' },
        ],
        returnType: 'ScreenshotResponse',
      },
      {
        name: 'getContent',
        description: 'Get page content',
        parameters: [],
        returnType: 'PageContent',
      },
    ],
  },
  {
    name: 'Memory',
    description: 'Memory operations',
    functions: [
      {
        name: 'saveMemory',
        description: 'Save memory',
        parameters: [
          { name: 'content', type: 'string', required: true, description: 'Memory content' },
          { name: 'tags', type: 'array', required: false, description: 'Memory tags' },
        ],
        returnType: 'MemoryResponse',
      },
      {
        name: 'searchMemory',
        description: 'Search memories',
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'Search query' },
        ],
        returnType: 'MemorySearchResponse',
      },
    ],
  },
  {
    name: 'Git',
    description: 'Git operations',
    functions: [
      {
        name: 'getStatus',
        description: 'Get git status',
        parameters: [],
        returnType: 'GitStatus',
      },
      {
        name: 'commit',
        description: 'Create commit',
        parameters: [
          { name: 'message', type: 'string', required: true, description: 'Commit message' },
          { name: 'files', type: 'array', required: false, description: 'Files to commit' },
        ],
        returnType: 'CommitResponse',
      },
      {
        name: 'push',
        description: 'Push changes',
        parameters: [
          { name: 'branch', type: 'string', required: false, description: 'Branch to push' },
        ],
        returnType: 'PushResponse',
      },
    ],
  },
];

// API wrapper functions
export class CodeboltAPI {
  private static baseUrl = '/api';

  static async callFunction(module: string, functionName: string, parameters: Record<string, any>) {
    try {
      const response = await fetch(`${this.baseUrl}/${module.toLowerCase()}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parameters,
          threadToken: CODEBOLT_CONFIG.threadToken,
          agentId: CODEBOLT_CONFIG.agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Codebolt API Error:', error);
      throw error;
    }
  }

  static getModules(): CodeboltModule[] {
    return CODEBOLT_MODULES;
  }

  static getModuleByName(name: string): CodeboltModule | undefined {
    return CODEBOLT_MODULES.find(module => module.name.toLowerCase() === name.toLowerCase());
  }

  static getFunctionByName(moduleName: string, functionName: string): CodeboltFunction | undefined {
    const module = this.getModuleByName(moduleName);
    return module?.functions.find(func => func.name.toLowerCase() === functionName.toLowerCase());
  }
}

export default CodeboltAPI;
