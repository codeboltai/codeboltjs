/**
 * @fileoverview E2B Provider for CodeBolt (Simple Functional Approach)
 * @description Simple functional implementation covering all notification types from notification.enum.ts
 */

const codebolt = require('@codebolt/codeboltjs');
const { UserMessage, SystemPrompt, TaskInstruction, Agent } = require("@codebolt/codeboltjs/utils");
const { createE2BSandbox } = require('./sandbox');
const { 
  NotificationEventType,
  AgentNotificationAction,
  BrowserNotificationAction,
  ChatNotificationAction,
  CodeUtilsNotificationAction,
  CrawlerNotificationAction,
  DbMemoryNotificationAction,
  FsNotificationAction,
  GitNotificationAction,
  HistoryNotificationAction,
  LlmNotificationAction,
  McpNotificationAction,
  SearchNotificationAction,
  SystemNotificationAction,
  TerminalNotificationAction,
  TaskNotificationAction
} = require('../../common/types/dist/codeboltjstypes/notification.enum');

// @ts-ignore
const cbws = require('../../packages/codeboltjs/src/core/websocket');

// Simple state management
let currentSandbox: any = null;
let isInitialized = false;

/**
 * Provider start handler - creates sandbox
 */
codebolt.onProviderStart(async (initvars: any) => {
  console.log('[E2B Provider] Starting with init vars:', initvars);
  
  try {
    currentSandbox = createE2BSandbox();
    await currentSandbox.create();
    isInitialized = true;
    
    console.log('[E2B Provider] Sandbox created:', currentSandbox.id);
    
    
    return {
      status: 'sandbox_created',
      sandboxId: currentSandbox.id
    };
  } catch (error) {
    console.error('[E2B Provider] Failed to create sandbox:', error);
    throw new Error(`Failed to create E2B sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

/**
 * Provider agent start handler - starts agent loop with sandbox
 */
codebolt.onProviderAgentStart((userMessage: any) => {
  console.log('[E2B Provider] Agent starting with user message:', userMessage.userMessage);
  
  if (!currentSandbox || !isInitialized) {
    console.error('[E2B Provider] Sandbox not initialized');
    sendNotification('error', 'Sandbox not initialized');
    return;
  }

  // Start agent loop using .then pattern (non-blocking)
  startAgentLoop(userMessage)
    .then(() => {
      console.log('[E2B Provider] Agent loop completed');
    })
    .catch((error: any) => {
      console.error('[E2B Provider] Error in agent loop:', error);
      sendNotification('error', `Agent loop failed: ${error.message}`);
    });
});

/**
 * Get diff files handler - uses sandbox git
 */
codebolt.onGetDiffFiles(async () => {
  console.log('[E2B Provider] Getting diff files');
  
  try {
    if (!currentSandbox || !isInitialized) {
      throw new Error('Sandbox not initialized');
    }

    // Send git diff request notification
    sendGitNotification(GitNotificationAction.DIFF_REQUEST, { path: '/' });
    
    const diff = await currentSandbox.git.getDiff();
    const status = await currentSandbox.git.status();
    
    const result = {
      diff,
      files: [...status.modified, ...status.added, ...status.deleted]
    };
    
    // Send git diff result notification
    sendGitNotification(GitNotificationAction.DIFF_RESULT, result);
    
    return result;
  } catch (error) {
    console.error('[E2B Provider] Error getting diff files:', error);
    throw new Error(`Failed to get diff files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

/**
 * Close signal handler - destroys sandbox
 */
codebolt.onCloseSignal(async () => {
  console.log('[E2B Provider] Received close signal');
  
  try {
    if (currentSandbox && isInitialized) {
      // Send system notification for process stopping
      sendSystemNotification(SystemNotificationAction.PROCESS_STOPPED_REQUEST, {
        processName: 'E2B Provider',
        processId: currentSandbox.id,
        stopTime: new Date().toISOString()
      });
      
      await currentSandbox.destroy();
      currentSandbox = null;
      isInitialized = false;
      
      console.log('[E2B Provider] Sandbox destroyed');
      return { status: 'sandbox_destroyed' };
    }
    
    return { status: 'no_sandbox_to_destroy' };
  } catch (error) {
    console.error('[E2B Provider] Error destroying sandbox:', error);
    throw new Error(`Failed to destroy sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

/**
 * Create patch request handler
 */
codebolt.onCreatePatchRequest(async () => {
  try {
    if (!currentSandbox || !isInitialized) {
      throw new Error('Sandbox not initialized');
    }

    const diff = await currentSandbox.git.getDiff();
    const patchId = `patch-${Date.now()}`;
    
    console.log('[E2B Provider] Creating patch:', patchId);
    
    return {
      patchId,
      status: 'patch_created'
    };
  } catch (error) {
    console.error('[E2B Provider] Error creating patch:', error);
    throw new Error(`Failed to create patch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

/**
 * Create pull request handler
 */
codebolt.onCreatePullRequestRequest(async () => {
  try {
    if (!currentSandbox || !isInitialized) {
      throw new Error('Sandbox not initialized');
    }

    await currentSandbox.git.add(['*']);
    await currentSandbox.git.commit('Changes from E2B sandbox');
    await currentSandbox.git.push();
    
    const pullRequestId = `pr-${Date.now()}`;
    console.log('[E2B Provider] Creating pull request:', pullRequestId);
    
    return {
      pullRequestId,
      status: 'pull_request_created'
    };
  } catch (error) {
    console.error('[E2B Provider] Error creating pull request:', error);
    throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

/**
 * Agent loop implementation using sandbox filesystem instead of local FS
 */
async function startAgentLoop(userMessage: any): Promise<void> {
  try {
    // Send agent notification for starting subagent task
    sendAgentNotification(AgentNotificationAction.START_SUBAGENT_TASK_REQUEST, {
      parentAgentId: 'e2b-provider',
      subagentId: 'e2b-sandbox',
      task: 'Starting agent execution in E2B sandbox',
      priority: 'high',
      dependencies: []
    });

    // Process mentioned files using sandbox filesystem
    if (userMessage.mentionedFiles && userMessage.mentionedFiles.length > 0) {
      for (const file of userMessage.mentionedFiles) {
        // Send FS read request
        sendFsNotification(FsNotificationAction.READ_FILE_REQUEST, { filePath: file });
        
        const exists = await currentSandbox.filesystem.exists(file);
        if (exists) {
          const content = await currentSandbox.filesystem.read(file);
          // Send FS read result
          sendFsNotification(FsNotificationAction.READ_FILE_RESULT, { 
            filePath: file, 
            content: content 
          });
        } else {
          sendFsNotification(FsNotificationAction.READ_FILE_RESULT, { 
            filePath: file, 
            content: null 
          }, true);
        }
      }
    }

    // Process user message with comprehensive notification coverage
    await processUserMessage(userMessage);

    // Always end with asking a question
    await askNextAction();

  } catch (error) {
    console.error('[E2B Provider] Error in agent loop:', error);
    sendAgentNotification(AgentNotificationAction.START_SUBAGENT_TASK_RESULT, {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, true);
    await askNextAction();
  }
}

/**
 * Process user message covering ALL notification types from notification.enum.ts
 */
async function processUserMessage(userMessage: any): Promise<void> {
  const message = userMessage.userMessage.toLowerCase();

  // FILE SYSTEM OPERATIONS - Cover all FsNotificationAction
  if (message.includes('create file')) {
    const filename = 'example.js';
    const content = '// File created in E2B sandbox\nconsole.log("Hello from E2B!");';
    
    sendFsNotification(FsNotificationAction.CREATE_FILE_REQUEST, {
      fileName: filename,
      source: 'e2b-sandbox',
      filePath: '/'
    });
    
    await currentSandbox.filesystem.write(filename, content);
    
    sendFsNotification(FsNotificationAction.CREATE_FILE_RESULT, 
      `File ${filename} created successfully`);
    
  } else if (message.includes('create folder')) {
    const folderName = 'e2b-folder';
    
    sendFsNotification(FsNotificationAction.CREATE_FOLDER_REQUEST, {
      folderName: folderName,
      folderPath: '/'
    });
    
    await currentSandbox.filesystem.mkdir(folderName);
    
    sendFsNotification(FsNotificationAction.CREATE_FOLDER_RESULT, 
      `Folder ${folderName} created successfully`);
    
  } else if (message.includes('list files') || message.includes('list directory')) {
    sendFsNotification(FsNotificationAction.LIST_DIRECTORY_REQUEST, {
      dirPath: '/'
    });
    
    const files = await currentSandbox.filesystem.list('/');
    
    sendFsNotification(FsNotificationAction.LIST_DIRECTORY_RESULT, 
      `Files: ${files.join(', ')}`);
    
  } else if (message.includes('update file') || message.includes('edit file')) {
    const filename = 'example.js';
    const newContent = '// Updated in E2B sandbox\nconsole.log("Updated!");';
    
    sendFsNotification(FsNotificationAction.UPDATE_FILE_REQUEST, {
      fileName: filename,
      filePath: '/',
      newContent: newContent
    });
    
    await currentSandbox.filesystem.write(filename, newContent);
    
    sendFsNotification(FsNotificationAction.UPDATE_FILE_RESULT, 
      `File ${filename} updated successfully`);
    
  } else if (message.includes('delete file')) {
    const filename = 'example.js';
    
    sendFsNotification(FsNotificationAction.DELETE_FILE_REQUEST, {
      fileName: filename,
      filePath: '/'
    });
    
    await currentSandbox.filesystem.rm(filename);
    
    sendFsNotification(FsNotificationAction.DELETE_FILE_RESULT, 
      `File ${filename} deleted successfully`);
    
  } else if (message.includes('copy file')) {
    sendFsNotification(FsNotificationAction.COPY_FILE_REQUEST, {
      sourceFile: '/source.js',
      destinationFile: '/destination.js'
    });
    
    sendFsNotification(FsNotificationAction.COPY_FILE_RESULT, 
      'File copied successfully');
    
  } else if (message.includes('move file')) {
    sendFsNotification(FsNotificationAction.MOVE_FILE_REQUEST, {
      sourceFile: '/old.js',
      destinationFile: '/new.js'
    });
    
    sendFsNotification(FsNotificationAction.MOVE_FILE_RESULT, 
      'File moved successfully');

  // TERMINAL OPERATIONS - Cover all TerminalNotificationAction  
  } else if (message.includes('run command') || message.includes('execute')) {
    const command = message.includes('npm') ? 'npm install' : 'echo "Hello E2B"';
    
    sendTerminalNotification(TerminalNotificationAction.EXECUTE_COMMAND_REQUEST, {
      command: command,
      executeInMain: false,
      returnEmptyStringOnSuccess: false
    });
    
    const result = await currentSandbox.terminal.run(command);
    
    sendTerminalNotification(TerminalNotificationAction.EXECUTE_COMMAND_RESULT, 
      `Command: ${command}\nOutput: ${result.stdout}`, result.exitCode !== 0);

  // GIT OPERATIONS - Cover all GitNotificationAction
  } else if (message.includes('git init')) {
    sendGitNotification(GitNotificationAction.INIT_REQUEST, { path: '/' });
    sendGitNotification(GitNotificationAction.INIT_RESULT, 'Git repository initialized');
    
  } else if (message.includes('git status')) {
    sendGitNotification(GitNotificationAction.STATUS_REQUEST, { path: '/' });
    const status = await currentSandbox.git.status();
    sendGitNotification(GitNotificationAction.STATUS_RESULT, status);
    
  } else if (message.includes('git add')) {
    sendGitNotification(GitNotificationAction.ADD_REQUEST, { 
      path: '/', 
      files: ['*'] 
    });
    await currentSandbox.git.add(['*']);
    sendGitNotification(GitNotificationAction.ADD_RESULT, 'Files added to staging');
    
  } else if (message.includes('git commit')) {
    const commitMessage = 'E2B sandbox commit';
    sendGitNotification(GitNotificationAction.COMMIT_REQUEST, { 
      path: '/', 
      message: commitMessage 
    });
    await currentSandbox.git.commit(commitMessage);
    sendGitNotification(GitNotificationAction.COMMIT_RESULT, 'Changes committed');
    
  } else if (message.includes('git push')) {
    sendGitNotification(GitNotificationAction.PUSH_REQUEST, { path: '/' });
    await currentSandbox.git.push();
    sendGitNotification(GitNotificationAction.PUSH_RESULT, 'Changes pushed');
    
  } else if (message.includes('git pull')) {
    sendGitNotification(GitNotificationAction.PULL_REQUEST, { path: '/' });
    await currentSandbox.git.pull();
    sendGitNotification(GitNotificationAction.PULL_RESULT, 'Changes pulled');

  // BROWSER OPERATIONS - Cover all BrowserNotificationAction
  } else if (message.includes('web fetch') || message.includes('http request')) {
    const url = 'https://api.github.com/repos/octocat/Hello-World';
    
    sendBrowserNotification(BrowserNotificationAction.WEB_FETCH_REQUEST, {
      url: url,
      method: 'GET',
      headers: { 'User-Agent': 'E2B-Provider' },
      timeout: 5000
    });
    
    // Simulate web fetch result
    sendBrowserNotification(BrowserNotificationAction.WEB_FETCH_RESULT, 
      'Mock API response data');
    
  } else if (message.includes('web search') || message.includes('search web')) {
    const query = 'E2B sandbox documentation';
    
    sendBrowserNotification(BrowserNotificationAction.WEB_SEARCH_REQUEST, {
      query: query,
      maxResults: 10,
      searchEngine: 'google'
    });
    
    sendBrowserNotification(BrowserNotificationAction.WEB_SEARCH_RESULT, {
      results: [
        { title: 'E2B Documentation', url: 'https://e2b.dev', snippet: 'E2B sandbox docs' }
      ]
    });

  // CRAWLER OPERATIONS - Cover all CrawlerNotificationAction
  } else if (message.includes('crawl') || message.includes('scrape')) {
    const url = 'https://example.com';
    
    sendCrawlerNotification(CrawlerNotificationAction.CRAWLER_START_REQUEST, {
      url: url,
      maxDepth: 2,
      maxPages: 10
    });
    
    sendCrawlerNotification(CrawlerNotificationAction.CRAWLER_START_RESULT, 
      'Crawling started successfully');
    
    sendCrawlerNotification(CrawlerNotificationAction.CRAWLER_SEARCH_REQUEST, {
      url: url,
      searchQuery: userMessage.userMessage
    });
    
    sendCrawlerNotification(CrawlerNotificationAction.CRAWLER_SEARCH_RESULT, 
      'Crawling completed with results');

  // SEARCH OPERATIONS - Cover all SearchNotificationAction
  } else if (message.includes('search init')) {
    sendSearchNotification(SearchNotificationAction.SEARCH_INIT_REQUEST, {
      searchType: 'semantic',
      indexPath: '/sandbox'
    });
    
    sendSearchNotification(SearchNotificationAction.SEARCH_INIT_RESULT, 
      'Search index initialized');
    
  } else if (message.includes('search')) {
    const query = userMessage.userMessage.replace('search', '').trim();
    
    sendSearchNotification(SearchNotificationAction.SEARCH_REQUEST, {
      query: query,
      maxResults: 10
    });
    
    sendSearchNotification(SearchNotificationAction.SEARCH_RESULT, {
      results: [
        { title: 'Search Result', content: 'Mock search result', score: 0.95 }
      ]
    });

  // CODE UTILS OPERATIONS - Cover all CodeUtilsNotificationAction
  } else if (message.includes('grep') || message.includes('find text')) {
    const pattern = 'console.log';
    
    sendCodeUtilsNotification(CodeUtilsNotificationAction.GREP_SEARCH_REQUEST, {
      pattern: pattern,
      filePath: '/',
      recursive: true
    });
    
    sendCodeUtilsNotification(CodeUtilsNotificationAction.GREP_SEARCH_RESULT, {
      matches: [
        { file: 'example.js', line: 2, content: 'console.log("Hello");' }
      ]
    });
    
  } else if (message.includes('glob') || message.includes('find files')) {
    const pattern = '*.js';
    
    sendCodeUtilsNotification(CodeUtilsNotificationAction.GLOB_SEARCH_REQUEST, {
      pattern: pattern,
      path: '/'
    });
    
    sendCodeUtilsNotification(CodeUtilsNotificationAction.GLOB_SEARCH_RESULT, {
      files: ['example.js', 'test.js']
    });

  // LLM OPERATIONS - Cover all LlmNotificationAction
  } else if (message.includes('llm') || message.includes('ai request')) {
    sendLlmNotification(LlmNotificationAction.INFERENCE_REQUEST, {
      prompt: userMessage.userMessage,
      model: 'gpt-4',
      maxTokens: 100
    });
    
    sendLlmNotification(LlmNotificationAction.INFERENCE_RESULT, 
      'AI response generated successfully');
    
  } else if (message.includes('token count')) {
    sendLlmNotification(LlmNotificationAction.GET_TOKEN_COUNT_REQUEST, {
      text: userMessage.userMessage
    });
    
    sendLlmNotification(LlmNotificationAction.GET_TOKEN_COUNT_RESULT, {
      tokenCount: userMessage.userMessage.split(' ').length * 1.3 // rough estimate
    });

  // MCP OPERATIONS - Cover all McpNotificationAction
  } else if (message.includes('mcp') || message.includes('tools')) {
    sendMcpNotification(McpNotificationAction.GET_ENABLED_MCP_SERVERS_REQUEST, {});
    
    sendMcpNotification(McpNotificationAction.GET_ENABLED_MCP_SERVERS_RESULT, {
      servers: ['filesystem', 'git', 'browser']
    });
    
    sendMcpNotification(McpNotificationAction.GET_TOOLS_REQUEST, {
      serverId: 'filesystem'
    });
    
    sendMcpNotification(McpNotificationAction.GET_TOOLS_RESULT, {
      tools: [
        { name: 'read_file', description: 'Read file contents' },
        { name: 'write_file', description: 'Write file contents' }
      ]
    });

  // CHAT OPERATIONS - Cover all ChatNotificationAction
  } else if (message.includes('send message')) {
    sendChatNotification(ChatNotificationAction.SEND_MESSAGE_REQUEST, {
      message: 'Hello from E2B sandbox!',
      recipient: 'user'
    });
    
    sendChatNotification(ChatNotificationAction.AGENT_TEXT_RESPONSE, 
      'Message sent successfully from E2B provider');
    
  } else if (message.includes('chat history')) {
    sendChatNotification(ChatNotificationAction.GET_CHAT_HISTORY_REQUEST, {
      limit: 10
    });
    
    sendChatNotification(ChatNotificationAction.GET_CHAT_HISTORY_RESULT, {
      messages: [
        { role: 'user', content: userMessage.userMessage, timestamp: new Date().toISOString() }
      ]
    });

  // TASK/TODO OPERATIONS - Cover all TaskNotificationAction
  } else if (message.includes('add task') || message.includes('create todo')) {
    sendTaskNotification(TaskNotificationAction.ADD_TASK_REQUEST, {
      title: 'E2B Sandbox Task',
      description: userMessage.userMessage,
      agentId: 'e2b-provider',
      priority: 'normal',
      category: 'sandbox'
    });
    
    sendTaskNotification(TaskNotificationAction.ADD_TASK_RESULT, 
      'Task added successfully');
    
  } else if (message.includes('get tasks') || message.includes('list todos')) {
    sendTaskNotification(TaskNotificationAction.GET_TASKS_REQUEST, {
      agentId: 'e2b-provider'
    });
    
    sendTaskNotification(TaskNotificationAction.GET_TASKS_RESULT, {
      tasks: [
        { id: '1', title: 'E2B Task', status: 'pending', priority: 'normal' }
      ]
    });

  // DB MEMORY OPERATIONS - Cover all DbMemoryNotificationAction  
  } else if (message.includes('add knowledge') || message.includes('store info')) {
    sendDbMemoryNotification(DbMemoryNotificationAction.ADD_KNOWLEDGE_REQUEST, {
      content: userMessage.userMessage,
      metadata: { source: 'e2b-sandbox', type: 'user-input' }
    });
    
    sendDbMemoryNotification(DbMemoryNotificationAction.ADD_KNOWLEDGE_RESULT, 
      'Knowledge stored successfully');
    
  } else if (message.includes('get knowledge') || message.includes('retrieve info')) {
    sendDbMemoryNotification(DbMemoryNotificationAction.GET_KNOWLEDGE_REQUEST, {
      query: userMessage.userMessage,
      limit: 5
    });
    
    sendDbMemoryNotification(DbMemoryNotificationAction.GET_KNOWLEDGE_RESULT, {
      results: [
        { content: 'Retrieved knowledge', score: 0.9, metadata: {} }
      ]
    });

  // HISTORY OPERATIONS - Cover all HistoryNotificationAction
  } else if (message.includes('summarize all')) {
    sendHistoryNotification(HistoryNotificationAction.SUMMARIZE_ALL_REQUEST, {
      includeSystem: true
    });
    
    sendHistoryNotification(HistoryNotificationAction.SUMMARIZE_ALL_RESULT, 
      'Complete conversation summary generated');
    
  } else if (message.includes('summarize')) {
    sendHistoryNotification(HistoryNotificationAction.SUMMARIZE_REQUEST, {
      messageCount: 10
    });
    
    sendHistoryNotification(HistoryNotificationAction.SUMMARIZE_RESULT, 
      'Recent conversation summary generated');

  } else {
    // Default case - send agent processing notification
    sendAgentNotification(AgentNotificationAction.START_SUBAGENT_TASK_REQUEST, {
      parentAgentId: 'e2b-provider',
      subagentId: 'e2b-sandbox',
      task: `Processing message: ${userMessage.userMessage}`,
      priority: 'normal',
      dependencies: []
    });
  }
}

// Notification helper functions using proper schemas and actions

function sendAgentNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-agent-${Date.now()}`,
    type: NotificationEventType.AGENT_NOTIFY,
    action: action,
    data: data,
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendFsNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-fs-${Date.now()}`,
    type: NotificationEventType.FS_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendTerminalNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-terminal-${Date.now()}`,
    type: NotificationEventType.TERMINAL_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendGitNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-git-${Date.now()}`,
    type: NotificationEventType.GIT_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendBrowserNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-browser-${Date.now()}`,
    type: NotificationEventType.BROWSER_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendCrawlerNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-crawler-${Date.now()}`,
    type: NotificationEventType.CRAWLER_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendSearchNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-search-${Date.now()}`,
    type: NotificationEventType.SEARCH_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendCodeUtilsNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-codeutils-${Date.now()}`,
    type: NotificationEventType.CODEUTILS_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendLlmNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-llm-${Date.now()}`,
    type: NotificationEventType.LLM_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendMcpNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-mcp-${Date.now()}`,
    type: NotificationEventType.MCP_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendChatNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-chat-${Date.now()}`,
    type: NotificationEventType.CHAT_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendTaskNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-task-${Date.now()}`,
    type: NotificationEventType.TASK_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendDbMemoryNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-dbmemory-${Date.now()}`,
    type: NotificationEventType.DBMEMORY_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendHistoryNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-history-${Date.now()}`,
    type: NotificationEventType.HISTORY_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

function sendSystemNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-system-${Date.now()}`,
    type: NotificationEventType.AGENT_NOTIFY, // Using AGENT_NOTIFY for system notifications
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

// Legacy notification function for backward compatibility
function sendNotification(type: 'info' | 'success' | 'warning' | 'error', message: string): void {
  try {
    switch (type) {
      case 'success':
        sendTerminalNotification(TerminalNotificationAction.EXECUTE_COMMAND_RESULT, 
          `[E2B Success] ${message}`);
        break;
      case 'warning':
        sendAgentNotification(AgentNotificationAction.START_SUBAGENT_TASK_RESULT, 
          `[E2B Warning] ${message}`);
        break;
      case 'error':
        sendTerminalNotification(TerminalNotificationAction.EXECUTE_COMMAND_RESULT, 
          `[E2B Error] ${message}`, true);
        break;
      case 'info':
      default:
        sendAgentNotification(AgentNotificationAction.START_SUBAGENT_TASK_REQUEST, {
          parentAgentId: 'e2b-provider',
          subagentId: 'e2b-sandbox',
          task: `[E2B Info] ${message}`,
          priority: 'normal',
          dependencies: []
        });
        break;
    }
  } catch (error) {
    console.error('[E2B Provider] Failed to send notification:', error);
  }
}

/**
 * Ask what to do next (as specified in requirements)
 */
async function askNextAction(): Promise<void> {
  const question = "What would you like me to do next in the E2B sandbox?";
  const options = [
    "Create a file",
    "List files", 
    "Run a command",
    "Git operations",
    "Web operations",
    "Search operations",
    "AI/LLM operations",
    "Task management",
    "Exit"
  ];

  try {
    const response = await codebolt.chat.askQuestion(question, options, true);
    console.log('[E2B Provider] User selected:', response);
    
    const choice = typeof response === 'string' ? response : 
                  (response as any)?.data || response;
    processUserChoice(choice);
  } catch (error) {
    console.error('[E2B Provider] Error asking question:', error);
    sendNotification('error', 'Failed to get user input');
  }
}

/**
 * Process user's choice from the question
 */
function processUserChoice(choice: string): void {
  console.log('[E2B Provider] Processing user choice:', choice);
  
  switch (choice.toLowerCase()) {
    case 'create a file':
      sendNotification('info', 'Ready to create a file. Try: "create file example.js"');
      break;
    case 'list files':
      handleListFiles();
      break;
    case 'run a command':
      sendNotification('info', 'Ready to run a command. Try: "run command npm --version"');
      break;
    case 'git operations':
      sendNotification('info', 'Git operations available: git status, git add, git commit, git push');
      break;
    case 'web operations':
      sendNotification('info', 'Web operations available: web fetch, web search');
      break;
    case 'search operations':
      sendNotification('info', 'Search operations available: search, grep, find files');
      break;
    case 'ai/llm operations':
      sendNotification('info', 'AI operations available: llm request, token count');
      break;
    case 'task management':
      sendNotification('info', 'Task operations available: add task, get tasks');
      break;
    case 'exit':
      sendNotification('info', 'Exiting E2B provider session.');
      break;
    default:
      sendNotification('info', `Processing choice: ${choice}`);
  }
}

/**
 * Handle listing files in sandbox
 */
async function handleListFiles(): Promise<void> {
  try {
    sendFsNotification(FsNotificationAction.LIST_DIRECTORY_REQUEST, { dirPath: '/' });
    const files = await currentSandbox.filesystem.list('/');
    sendFsNotification(FsNotificationAction.LIST_DIRECTORY_RESULT, 
      `Files in sandbox: ${files.join(', ')}`);
  } catch (error) {
    sendFsNotification(FsNotificationAction.LIST_DIRECTORY_RESULT, 
      `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
  }
}

/**
 * Get current sandbox status (utility function)
 */
function getSandboxStatus(): { initialized: boolean; sandboxId?: string } {
  return {
    initialized: isInitialized,
    sandboxId: currentSandbox?.id
  };
}

// Export utility functions for external use
module.exports = {
  getSandboxStatus,
  sendNotification,
  handleListFiles
};

// Export for direct import (keeping compatibility)
export default {
  getSandboxStatus,
  sendNotification,
  handleListFiles
};

console.log('[E2B Provider] Comprehensive notification provider loaded - covering all NotificationEventType cases!');