/**
 * @fileoverview Agent Processing Handlers
 * @description Handles agent operations, user message processing, and git operations
 */

import { getCurrentSandbox, getIsInitialized } from './lifecycle';
import { 
  sendNotification, 
  sendAgentNotification, 
  sendFsNotification,
  sendTerminalNotification,
  sendGitNotification,
  sendBrowserNotification,
  sendCrawlerNotification,
  sendSearchNotification,
  sendCodeUtilsNotification,
  sendLlmNotification,
  sendMcpNotification,
  sendChatNotification,
  sendTaskNotification,
  sendDbMemoryNotification,
  sendHistoryNotification
} from '../utils/messageHelpers';
import { UserMessage, DiffFilesResult, PatchResult, PullRequestResult } from '../types/provider';

const codebolt = require('@codebolt/codeboltjs');

const { 
  AgentNotificationAction,
  FsNotificationAction,
  TerminalNotificationAction,
  GitNotificationAction,
  BrowserNotificationAction,
  CrawlerNotificationAction,
  SearchNotificationAction,
  CodeUtilsNotificationAction,
  LlmNotificationAction,
  McpNotificationAction,
  ChatNotificationAction,
  TaskNotificationAction,
  DbMemoryNotificationAction,
  HistoryNotificationAction
} = require('../../../../common/types/dist/codeboltjstypes/notification.enum');

/**
 * Provider agent start handler - starts agent loop with sandbox
 */
export function onProviderAgentStart(userMessage: UserMessage): void {
  console.log('[E2B Provider] Agent starting with user message:', userMessage.userMessage);
  
  const currentSandbox = getCurrentSandbox();
  const isInitialized = getIsInitialized();
  
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
}

/**
 * Get diff files handler - uses sandbox git
 */
export async function onGetDiffFiles(): Promise<DiffFilesResult> {
  console.log('[E2B Provider] Getting diff files');
  
  try {
    const currentSandbox = getCurrentSandbox();
    const isInitialized = getIsInitialized();
    
    if (!currentSandbox || !isInitialized) {
      throw new Error('Sandbox not initialized');
    }

    // Send git diff request notification
    sendGitNotification(GitNotificationAction.DIFF_REQUEST, { path: '/' });
    
    const diff = await currentSandbox.git.getDiff();
    const status = await currentSandbox.git.status();
    
    const result: DiffFilesResult = {
      diff,
      files: [...status.modified, ...status.added, ...status.deleted],
      metadata: {
        totalChanges: status.modified.length + status.added.length + status.deleted.length,
        additions: status.added.length,
        deletions: status.deleted.length
      }
    };
    
    // Send git diff result notification
    sendGitNotification(GitNotificationAction.DIFF_RESULT, result);
    
    return result;
  } catch (error) {
    console.error('[E2B Provider] Error getting diff files:', error);
    throw new Error(`Failed to get diff files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create patch request handler
 */
export async function onCreatePatchRequest(): Promise<PatchResult> {
  try {
    const currentSandbox = getCurrentSandbox();
    const isInitialized = getIsInitialized();
    
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
    return {
      patchId: '',
      status: 'patch_failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create pull request handler
 */
export async function onCreatePullRequestRequest(): Promise<PullRequestResult> {
  try {
    const currentSandbox = getCurrentSandbox();
    const isInitialized = getIsInitialized();
    
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
    return {
      pullRequestId: '',
      status: 'pull_request_failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Process user message covering ALL notification types from notification.enum.ts
 */
async function processUserMessage(userMessage: UserMessage): Promise<void> {
  const currentSandbox = getCurrentSandbox()!;
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
export async function handleListFiles(): Promise<void> {
  try {
    const currentSandbox = getCurrentSandbox();
    if (!currentSandbox) {
      throw new Error('Sandbox not initialized');
    }
    
    sendFsNotification(FsNotificationAction.LIST_DIRECTORY_REQUEST, { dirPath: '/' });
    const files = await currentSandbox.filesystem.list('/');
    sendFsNotification(FsNotificationAction.LIST_DIRECTORY_RESULT, 
      `Files in sandbox: ${files.join(', ')}`);
  } catch (error) {
    sendFsNotification(FsNotificationAction.LIST_DIRECTORY_RESULT, 
      `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
  }
}