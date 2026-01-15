// These are the types that are used by the SDK that are exposed to the user.

/**
 * TypeScript type definitions for all functions exposed by the CodeboltJS SDK
 * 
 * This file provides comprehensive type definitions for:
 * - Core Codebolt class methods and properties
 * - All module functions (fs, browser, chat, terminal, git, etc.)
 * - Function parameters and return types
 * - Configuration options and interfaces
 */

// ================================
// Import Required Types
// ================================

// Basic types from the library
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  metadata?: Record<string, any>;
}

// Tool parameter type
export interface ToolParameters {
  [key: string]: unknown;
}

export interface UserMessage {
  type: string;
  userMessage: string;
  currentFile: string;
  mentionedFiles: string[];
  mentionedFullPaths: string[];
  mentionedMCPs: { toolbox: string, toolName: string }[];
  mentionedFolders: string[];
  uploadedImages: string[];
  selectedAgent: {
    id: string;
    name: string;
  };
  messageId: string;
  threadId: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  remixPrompt?: string;
  mentionedAgents?: string[];
}

export interface Message {
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: any[] | string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
  [key: string]: any;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: any;
  };
}

export interface AgentDetail {
  id: string;
  name: string;
  description: string;
  capabilities?: string[];
  isLocal: boolean;
  version: string;
  status: string;
  unique_id: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  phase?: string;
  category?: string;
  agentId: string;
  subtasks: SubTask[];
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  requirements?: string[];
}

export interface VectorItem {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  content?: string;
}

export interface FileEntry {
  name: string;
  isDirectory: boolean;
  size?: number;
  modified?: string;
  created?: string;
  permissions?: string;
}

export interface BrowserElement {
  id: string;
  tag: string;
  text: string;
  attributes: Record<string, string>;
}

export interface GitFileStatus {
  path: string;
  index: string;
  working_dir: string;
}

export interface StatusResult {
  not_added: string[];
  conflicted: string[];
  created: string[];
  deleted: string[];
  modified: string[];
  renamed: string[];
  files: GitFileStatus[];
  staged: string[];
  ahead: number;
  behind: number;
  current: string | null;
  tracking: string | null;
  detached: boolean;
}

export interface CommitSummary {
  hash: string;
  date: string;
  message: string;
  refs: string;
  body: string;
  author_name: string;
  author_email: string;
}

export interface MCPTool {
  name?: string;
  toolbox?: string;
  toolName?: string;
  tools?: any[];
  description?: string;
  parameters?: Record<string, any>;
}

export interface ASTNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: ASTNode[];
}
export enum LogType {
  info = "info",
  error = "error",
  warning = "warning"
}

export interface DebugAddLogResponse {
  type: 'debugAddLogResponse';
  succes: true; // Note: keeping the typo as it exists in the source code
}

export interface OpenDebugBrowserResponse {
  type: 'openDebugBrowserResponse';
  succes: true; // Note: keeping the typo as it exists in the source code
}

// ================================
// File System Module Types
// ================================

export interface FileSystemModule {
  /**
   * Creates a new file
   * @param fileName - The name of the file to create
   * @param source - The source content to write into the file
   * @param filePath - The path where the file should be created
   */
  createFile(fileName: string, source: string, filePath: string): Promise<APIResponse>;

  /**
   * Creates a new folder
   * @param folderName - The name of the folder to create
   * @param folderPath - The path where the folder should be created
   */
  createFolder(folderName: string, folderPath: string): Promise<APIResponse>;

  /**
   * Reads the content of a file
   * @param filePath - The path of the file to read
   */
  readFile(filePath: string): Promise<APIResponse<string>>;

  /**
   * Updates the content of a file
   * @param filename - The name of the file to update
   * @param filePath - The path of the file to update
   * @param newContent - The new content to write into the file
   */
  updateFile(filename: string, filePath: string, newContent: string): Promise<APIResponse>;

  /**
   * Deletes a file
   * @param filename - The name of the file to delete
   * @param filePath - The path of the file to delete
   */
  deleteFile(filename: string, filePath: string): Promise<APIResponse>;

  /**
   * Deletes a folder
   * @param folderName - The name of the folder to delete
   * @param folderPath - The path of the folder to delete
   */
  deleteFolder(folderName: string, folderPath: string): Promise<APIResponse>;

  /**
   * Lists files in a directory
   * @param folderPath - The directory path to list
   * @param isRecursive - Whether to list files recursively
   */
  listFile(folderPath: string, isRecursive?: boolean): Promise<APIResponse<FileEntry[]>>;

  /**
   * Lists all code definition names in a given path
   * @param path - The path to search for code definitions
   */
  listCodeDefinitionNames(path: string): Promise<APIResponse<string[]>>;

  /**
   * Searches files in a given path using a regex pattern
   * @param path - The path to search within
   * @param regex - The regex pattern to search for
   * @param filePattern - The file pattern to match files
   */
  searchFiles(path: string, regex: string, filePattern: string): Promise<APIResponse>;

  /**
   * Writes content to a file
   * @param relPath - The relative path of the file to write to
   * @param newContent - The new content to write into the file
   */
  writeToFile(relPath: string, newContent: string): Promise<APIResponse>;

  /**
   * Performs a grep search in files
   * @param path - The path to search within
   * @param query - The query to search for
   * @param includePattern - Pattern of files to include
   * @param excludePattern - Pattern of files to exclude
   * @param caseSensitive - Whether the search is case sensitive
   */
  grepSearch(path: string, query: string, includePattern?: string, excludePattern?: string, caseSensitive?: boolean): Promise<APIResponse>;

  /**
   * Performs a fuzzy search for files
   * @param query - The query to search for
   */
  fileSearch(query: string): Promise<APIResponse>;

  /**
   * Edits a file by applying a diff
   * @param targetFile - The target file to edit
   * @param codeEdit - The code edit to apply
   * @param diffIdentifier - The diff identifier
   * @param prompt - The prompt for the edit
   * @param applyModel - The model to apply the edit with
   */
  editFileWithDiff(targetFile: string, codeEdit: string, diffIdentifier: string, prompt: string, applyModel: string): Promise<APIResponse>;
}

// ================================
// Browser Module Types
// ================================

export interface BrowserModule {
  /**
   * Opens a new page in the browser
   */
  newPage(): Promise<APIResponse>;

  /**
   * Retrieves the current URL of the browser's active page
   */
  getUrl(): Promise<APIResponse<string>>;

  /**
   * Navigates to a specified URL
   * @param url - The URL to navigate to
   */
  goToPage(url: string): Promise<APIResponse>;

  /**
   * Takes a screenshot of the current page
   */
  screenshot(): Promise<APIResponse<string>>;

  /**
   * Retrieves the HTML content of the current page
   */
  getHTML(): Promise<APIResponse<string>>;

  /**
   * Retrieves the Markdown content of the current page
   */
  getMarkdown(): Promise<APIResponse<string>>;

  /**
   * Retrieves the PDF content of the current page
   */
  getPDF(): void;

  /**
   * Converts the PDF content of the current page to text
   */
  pdfToText(): void;

  /**
   * Extracts text from the current page
   */
  extractText(): Promise<APIResponse<string>>;

  /**
   * Retrieves the content of the current page
   */
  getContent(): Promise<APIResponse<string>>;

  /**
   * Clicks on a specified element on the page
   * @param elementid - The ID of the element to click
   */
  click(elementid: string): Promise<APIResponse>;

  /**
   * Types text into a specified element on the page
   * @param elementid - The ID of the element to type into
   * @param text - The text to type
   */
  type(elementid: string, text: string): Promise<APIResponse>;

  /**
   * Simulates the Enter key press on the current page
   */
  enter(): Promise<APIResponse>;

  /**
   * Scrolls the current page in a specified direction by a specified number of pixels
   * @param direction - The direction to scroll
   * @param pixels - The number of pixels to scroll
   */
  scroll(direction: string, pixels: string): Promise<APIResponse>;

  /**
   * Closes the current page
   */
  close(): void;

  /**
   * Performs a search on the current page using a specified query
   * @param elementid - The ID of the element to perform the search in
   * @param query - The search query
   */
  search(elementid: string, query: string): Promise<APIResponse>;

  /**
   * Gets browser information
   */
  getBrowserInfo(): Promise<APIResponse>;

  /**
   * Takes a snapshot of the page
   */
  getSnapShot(): Promise<APIResponse>;
}

// ================================
// Chat Module Types
// ================================

export interface ChatModule {
  /**
   * Retrieves the chat history from the server
   */
  getChatHistory(): Promise<APIResponse<any[]>>;

  /**
   * Sets a global request handler for all incoming messages
   * @param handler - The async handler function
   */
  setRequestHandler(handler: (request: any, response: (data: any) => void) => Promise<void> | void): void;

  /**
   * Sends a message through the WebSocket connection
   * @param message - The message to be sent
   * @param payload - Additional payload data
   */
  sendMessage(message: string, payload: any): void;

  /**
   * Waits for a reply to a sent message
   * @param message - The message for which a reply is expected
   */
  waitforReply(message: string): Promise<UserMessage>;

  /**
   * Notifies the server that a process has started
   * @param onStopClicked - Callback function to handle stop process events
   */
  processStarted(onStopClicked?: (message: any) => void): {
    stopProcess: () => void;
  };

  /**
   * Stops the ongoing process
   */
  stopProcess(): void;

  /**
   * Indicates that the process has finished
   */
  processFinished(): void;

  /**
   * Sends a confirmation request to the server with customizable options
   * @param confirmationMessage - The confirmation message
   * @param buttons - Array of button labels (optional)
   * @param withFeedback - Whether to include feedback option
   */
  sendConfirmationRequest(confirmationMessage: string, buttons?: string[], withFeedback?: boolean): Promise<APIResponse<string>>;

  /**
   * Asks a question (alias for sendConfirmationRequest)
   * @param question - The question to ask
   * @param buttons - Array of button labels (optional)
   * @param withFeedback - Whether to include feedback option
   */
  askQuestion(question: string, buttons?: string[], withFeedback?: boolean): Promise<APIResponse<string>>;

  /**
   * Sends a notification event to the server
   * @param notificationMessage - The message to be sent in the notification
   * @param type - The type of notification
   */
  sendNotificationEvent(notificationMessage: string, type: 'debug' | 'git' | 'planner' | 'browser' | 'editor' | 'terminal' | 'preview'): void;
}

// ================================
// Terminal Module Types
// ================================

export interface TerminalModule {
  /**
   * Executes a given command and returns the result
   * @param command - The command to be executed
   * @param returnEmptyStringOnSuccess - Whether to return empty string on success
   */
  executeCommand(command: string, returnEmptyStringOnSuccess?: boolean): Promise<APIResponse>;

  /**
   * Executes a given command and keeps running until an error occurs
   * @param command - The command to be executed
   * @param executeInMain - Whether to execute in main thread
   */
  executeCommandRunUntilError(command: string, executeInMain?: boolean): Promise<APIResponse>;

  /**
   * Sends a manual interrupt signal to the terminal
   */
  sendManualInterrupt(): Promise<APIResponse>;

  /**
   * Executes a given command and streams the output
   * @param command - The command to be executed
   * @param executeInMain - Whether to execute in main thread
   * @returns EventEmitter that streams the output data during command execution
   */
  executeCommandWithStream(command: string, executeInMain?: boolean): any; // EventEmitter-like object
}

// ================================
// Git Module Types
// ================================

export interface GitModule {
  /**
   * Initializes a new Git repository at the given path
   * @param path - The file system path where the Git repository should be initialized
   */
  init(path: string): Promise<APIResponse>;

  /**
   * Pulls the latest changes from the remote repository to the local repository
   */
  pull(): Promise<APIResponse>;

  /**
   * Pushes local repository changes to the remote repository
   */
  push(): Promise<APIResponse>;

  /**
   * Retrieves the status of the local repository
   */
  status(): Promise<APIResponse<StatusResult>>;

  /**
   * Adds all changes in the local repository to the staging area
   */
  addAll(): Promise<APIResponse>;

  /**
   * Commits the staged changes in the local repository with the given commit message
   * @param message - The commit message to use for the commit
   */
  commit(message: string): Promise<APIResponse>;

  /**
   * Checks out a branch or commit in the local repository
   * @param branch - The name of the branch or commit to check out
   */
  checkout(branch: string): Promise<APIResponse>;

  /**
   * Creates a new branch in the local repository
   * @param branch - The name of the new branch to create
   */
  branch(branch: string): Promise<APIResponse>;

  /**
   * Retrieves the commit logs for the local repository
   * @param path - The file system path of the local Git repository
   */
  logs(path: string): Promise<APIResponse<CommitSummary[]>>;

  /**
   * Retrieves the diff of changes for a specific commit in the local repository
   * @param commitHash - The hash of the commit to retrieve the diff for
   */
  diff(commitHash: string): Promise<APIResponse>;
}

// ================================
// LLM Module Types
// ================================

export interface LLMModule {
  /**
   * Sends an inference request to the LLM using OpenAI message format with tools support
   * @param params - The inference parameters
   * @param llmrole - The role of the LLM to determine which model to use
   */
  inference(params: {
    messages: Message[];
    tools?: any[];
    tool_choice?: string;
    full?: boolean;
    llmrole?: string;
    max_tokens?: number;
    temperature?: number;
    stream?: boolean;
  }, llmrole?: string): Promise<APIResponse<{ completion: any }>>;

  /**
   * Legacy method for backward compatibility - converts simple string prompt to message format
   * @deprecated Use the new inference method with proper message format instead
   * @param message - The input message or prompt to be sent to the LLM
   * @param llmrole - The role of the LLM to determine which model to use
   */
  legacyInference(message: string, llmrole: string): Promise<APIResponse>;
}

// ================================
// Task Module Types
// ================================

export interface TaskModule {
  /**
   * Adds a new task with enhanced parameters
   * @param params - The task parameters including title, agentId, description, etc.
   */
  addTask(params: {
    title: string;
    agentId?: string;
    description?: string;
    phase?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  }): Promise<APIResponse<Task>>;

  /**
   * Adds a task using simple string parameter (legacy support)
   * @param task - The task title
   * @param agentId - The agent ID (optional, defaults to 'default-agent')
   */
  addSimpleTask(task: string, agentId?: string): Promise<APIResponse<Task>>;

  /**
   * Retrieves all tasks with optional filtering
   * @param filters - Optional filters for agentId, category, phase, etc.
   */
  getTasks(filters?: {
    agentId?: string;
    category?: string;
    phase?: string;
    priority?: 'low' | 'medium' | 'high';
    completed?: boolean;
  }): Promise<APIResponse<Task[]>>;

  /**
   * Retrieves tasks for a specific agent
   * @param agentId - The agent ID
   */
  getTasksByAgent(agentId: string): Promise<APIResponse<Task[]>>;

  /**
   * Retrieves tasks by category
   * @param category - The category name
   */
  getTasksByCategory(category: string): Promise<APIResponse<Task[]>>;

  /**
   * Retrieves all available agents
   */
  getAllAgents(): Promise<APIResponse<any[]>>;

  /**
   * Updates an existing task
   * @param params - The task update parameters
   */
  updateTask(params: {
    taskId: string;
    title?: string;
    description?: string;
    phase?: string;
    category?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    agentId?: string;
  }): Promise<APIResponse<Task>>;

  /**
   * Updates an existing task using legacy string parameter
   * @param taskId - The task ID
   * @param task - The updated task information
   */
  updateSimpleTask(taskId: string, task: string): Promise<APIResponse<Task>>;

  /**
   * Deletes a task
   * @param taskId - The task ID to delete
   */
  deleteTask(taskId: string): Promise<APIResponse>;

  /**
   * Gets a task by ID
   * @param taskId - The task ID
   */
  getTask(taskId: string): Promise<APIResponse<Task>>;

  /**
   * Adds a subtask to an existing task
   * @param params - The subtask parameters
   */
  addSubTask(params: {
    taskId: string;
    title: string;
    description?: string;
    requirements?: string[];
  }): Promise<APIResponse<SubTask>>;

  /**
   * Updates an existing subtask
   * @param params - The subtask update parameters
   */
  updateSubTask(params: {
    taskId: string;
    subtaskId: string;
    title?: string;
    description?: string;
    completed?: boolean;
    requirements?: string[];
  }): Promise<APIResponse<SubTask>>;

  /**
   * Deletes a subtask
   * @param taskId - The parent task ID
   * @param subtaskId - The subtask ID to delete
   */
  deleteSubTask(taskId: string, subtaskId: string): Promise<APIResponse>;

  /**
   * Creates tasks from markdown content
   * @param params - The markdown parameters including content, agentId, phase, and category
   */
  createTasksFromMarkdown(params: {
    markdown: string;
    agentId?: string;
    phase?: string;
    category?: string;
  }): Promise<APIResponse<Task[]>>;

  /**
   * Exports tasks to markdown format
   * @param params - The export parameters including optional phase, agentId, and category filters
   */
  exportTasksToMarkdown(params?: {
    phase?: string;
    agentId?: string;
    category?: string;
  }): Promise<APIResponse<string>>;

  /**
   * Utility function to toggle task completion status
   * @param taskId - The task ID
   * @param completed - The new completion status
   */
  toggleTaskCompletion(taskId: string, completed: boolean): Promise<APIResponse<Task>>;

  /**
   * Utility function to toggle subtask completion status
   * @param taskId - The parent task ID
   * @param subtaskId - The subtask ID
   * @param completed - The new completion status
   */
  toggleSubTaskCompletion(taskId: string, subtaskId: string, completed: boolean): Promise<APIResponse<Task>>;

  /**
   * Utility function to set task priority
   * @param taskId - The task ID
   * @param priority - The new priority level
   */
  setTaskPriority(taskId: string, priority: 'low' | 'medium' | 'high'): Promise<APIResponse<Task>>;

  /**
   * Utility function to add tags to a task
   * @param taskId - The task ID
   * @param tags - The tags to add
   */
  addTaskTags(taskId: string, tags: string[]): Promise<APIResponse<Task>>;

  /**
   * Utility function to create a quick task with minimal parameters
   * @param title - The task title
   * @param agentId - The agent ID (optional, defaults to 'default-agent')
   * @param category - The category (optional)
   */
  createQuickTask(title: string, agentId?: string, category?: string): Promise<APIResponse<Task>>;
}

// ================================
// Vector Database Module Types
// ================================

export interface VectorDBModule {
  /**
   * Retrieves a vector from the vector database based on the provided key.
   * @param key - The key of the vector to retrieve.
   * @returns A promise that resolves with the retrieved vector.
   */
  getVector(key: string): Promise<APIResponse<VectorItem>>;

  /**
   * Adds a new vector item to the vector database.
   * @param item - The item to add to the vector.
   * @returns A promise that resolves when the item is successfully added.
   */
  addVectorItem(item: any): Promise<APIResponse>;

  /**
   * Queries a vector item from the vector database based on the provided key.
   * @param key - The key of the vector to query the item from.
   * @returns A promise that resolves with the queried vector item.
   */
  queryVectorItem(key: string): Promise<APIResponse<VectorItem>>;

  /**
   * Queries multiple vector items from the vector database.
   * @param items - Array of items to query.
   * @param dbPath - Path to the database.
   * @returns A promise that resolves with the queried vector items.
   */
  queryVectorItems(items: any[], dbPath: string): Promise<APIResponse<VectorItem[]>>;
}

// ================================
// Agent Module Types
// ================================

export interface AgentModule {
  /**
   * Starts an agent
   * @param agentName - The name of the agent to start
   */
  startAgent(agentName: string): Promise<APIResponse>;

  /**
   * Gets details of a specific agent
   * @param agentName - The name of the agent
   */
  getAgentsDetail(agentName: string): Promise<APIResponse<AgentDetail>>;

  /**
   * Gets a list of all agents
   */
  getAgentsList(): Promise<APIResponse<AgentDetail[]>>;

  /**
   * Finds an agent by criteria
   * @param criteria - Search criteria
   */
  findAgent(criteria: any): Promise<APIResponse<AgentDetail>>;
}

// ================================
// Code Utils Module Types
// ================================

// Import response types from existing schemas
import type { 
 
  GetMatcherListTreeResponse,
  GetMatchDetailResponse 
} from '../../wstypes/app-to-agent-ws/codeUtilsServiceResponses';

export interface JSTreeStructureItem {
  type: string;
  name: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  nodeType: string;
}

export interface JSTreeResponse {
  event: 'getJsTreeResponse';
  payload?: {
    filePath: string;
    structure: JSTreeStructureItem[];
  };
  error?: string;
}

export interface CodeUtilsModule {
  /**
   * Retrieves a JavaScript tree structure for a given file path.
   * @param filePath - The path of the file to retrieve the JS tree for.
   * @returns A promise that resolves with the JS tree response.
   */
  getJsTree(filePath?: string): Promise<JSTreeResponse>;

  /**
   * Retrieves all files as Markdown.
   * @returns A promise that resolves with the Markdown content of all files.
   */
  getAllFilesAsMarkDown(): Promise<any>;

  /**
   * Performs a matching operation based on the provided matcher definition and problem patterns.
   * @param matcherDefinition - The definition of the matcher (name, pattern, language, etc.).
   * @param problemPatterns - The patterns to match against (regex patterns with severity levels).
   * @param problems - Optional list of pre-existing problems to include.
   * @returns A promise that resolves with the matching problem response.
   */
  performMatch(
    matcherDefinition: object, 
    problemPatterns: any[], 
    problems?: any[]
  ): Promise<any>;

  /**
   * Retrieves the list of matchers.
   * @returns A promise that resolves with the list of matchers response.
   */
  getMatcherList(): Promise<GetMatcherListTreeResponse>;

  /**
   * Retrieves details of a match.
   * @param matcher - The matcher to retrieve details for (by name or identifier).
   * @returns A promise that resolves with the match detail response.
   */
  matchDetail(matcher: string): Promise<GetMatchDetailResponse>;
}

// ================================
// MCP Module Types
// ================================

// MCP configuration type
export interface MCPConfiguration {
  serverName: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MCPModule {
  /**
   * Lists available MCP tools from servers
   * @param servers - List of server names
   */
  listMcpFromServers(servers: string[]): Promise<APIResponse<Tool[]>>;

  /**
   * Gets tools from MCPs
   * @param mcps - List of MCP configurations
   */
  getTools(mcps: MCPConfiguration[]): Promise<APIResponse<Tool[]>>;

  /**
   * Executes an MCP tool
   * @param toolboxName - The toolbox name
   * @param actualToolName - The actual tool name
   * @param toolInput - The tool input parameters
   */
  executeTool(toolboxName: string, actualToolName: string, toolInput: ToolParameters): Promise<APIResponse>;

  /**
   * Configures an MCP server
   * @param options - Configuration options
   */
  configure(options: {
    serverName: string;
    config: Record<string, unknown>;
    enabled?: boolean;
  }): Promise<APIResponse>;
}

// ================================
// State Module Types
// ================================

export interface StateModule {
  /**
   * Updates application state
   * @param options - State update options
   */
  updateState(options: {
    key: string;
    value: any;
    merge?: boolean;
  }): Promise<APIResponse>;

  /**
   * Gets application state
   * @param key - State key to retrieve
   */
  getState(key?: string): Promise<APIResponse>;

  /**
   * Gets project state
   */
  getProjectState(): Promise<APIResponse>;

  /**
   * Updates project state
   * @param state - New project state
   */
  updateProjectState(state: any): Promise<APIResponse>;

  /**
   * Gets agent state
   * @param agentId - Agent ID
   */
  getAgentState(agentId?: string): Promise<APIResponse>;

  /**
   * Adds to agent state
   * @param data - Data to add to agent state
   */
  addToAgentState(data: any): Promise<APIResponse>;
}

// ================================
// Memory Module Types
// ================================

export interface MemoryModule {
  /**
   * Sets a memory value
   * @param options - Memory set options
   */
  set(options: {
    key: string;
    value: any;
    ttl?: number;
  }): Promise<APIResponse>;

  /**
   * Gets a memory value
   * @param options - Memory get options
   */
  get(options: {
    key: string;
    defaultValue?: any;
  }): Promise<APIResponse>;

  /**
   * Deletes a memory value
   * @param key - Memory key to delete
   */
  delete(key: string): Promise<APIResponse>;

  /**
   * Clears all memory
   */
  clear(): Promise<APIResponse>;
}

// ================================
// Debug Module Types
// ================================

export interface DebugModule {
  /**
   * Sends a log message to the debug websocket and waits for a response.
   * @param log - The log message to send.
   * @param type - The type of the log message (info, error, warning).
   * @returns A promise that resolves with the response from the debug event.
   */
  debug(log: string, type: LogType): Promise<DebugAddLogResponse>;

  /**
   * Requests to open a debug browser at the specified URL and port.
   * @param url - The URL where the debug browser should be opened.
   * @param port - The port on which the debug browser will listen.
   * @returns A promise that resolves with the response from the open debug browser event.
   */
  openDebugBrowser(url: string, port: number): Promise<OpenDebugBrowserResponse>;
}

// ================================
// Project Module Types
// ================================

export interface ProjectSettings {
  user_active_project_path: string;
  userprofile_llm_settings: string; // JSON string
  userprofile_default_llm: string; // JSON string
  projectName?: string;
  workspaceId?: number;
  [key: string]: any; // Allow additional project setting properties
}

export interface GetProjectPathResponse {
  type: 'getProjectPathResponse';
  success: true;
  message: 'Project path retrieved successfully';
  projectPath: string;
}

export interface GetProjectSettingsResponse {
  type: 'getProjectSettingsResponse';
  success: true;
  message: 'Project settings retrieved successfully';
  projectSettings: ProjectSettings;
}

export interface GetRepoMapResponse {
  type: 'getRepoMapResponse';
  success: true;
  message: 'Project repomap retrieved successfully';
  repoMap: string;
}

export interface GetEditorFileStatusResponseSuccess {
  type: 'getEditorFileStatusResponse';
  success: true;
  message: string;
  editorStatus: string;
}

export interface GetEditorFileStatusResponseError {
  type: 'getEditorFileStatusResponse';
  success: false;
  message: string;
  editorStatus: string;
}

export type GetEditorFileStatusResponse = GetEditorFileStatusResponseSuccess | GetEditorFileStatusResponseError;

export interface ProjectModule {
  /**
   * Retrieves the project settings from the server.
   * @returns A promise that resolves with the project settings response.
   */
  getProjectSettings(): Promise<GetProjectSettingsResponse>;

  /**
   * Retrieves the path of the current project.
   * @returns A promise that resolves with the project path response.
   */
  getProjectPath(): Promise<GetProjectPathResponse>;

  /**
   * Gets the repository map for the project.
   * @param message - Message containing repo map parameters.
   * @returns A promise that resolves with the repo map response.
   */
  getRepoMap(message: any): Promise<GetRepoMapResponse>;

  /**
   * Runs the project (fire and forget - no response expected).
   */
  runProject(): void;

  /**
   * Gets the editor file status.
   * @returns A promise that resolves with the editor file status response.
   */
  getEditorFileStatus(): Promise<GetEditorFileStatusResponse>;
}

// ================================
// Notification Module Types
// ================================

/**
 * Agent notification functions for subagent task operations
 */
export interface AgentNotifications {
  StartSubagentTaskRequestNotify(parentAgentId: string, subagentId: string, task: string, priority?: string, dependencies?: string[], toolUseId?: string): void;
  StartSubagentTaskResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  SubagentTaskCompletedNotify(parentAgentId: string, subagentId: string, taskId: string, result: any, status: string, toolUseId?: string): void;
}

/**
 * Browser notification functions for web operations
 */
export interface BrowserNotifications {
  WebFetchRequestNotify(url: string, method?: string, headers?: Record<string, string>, body?: any, timeout?: number, toolUseId?: string): void;
  WebFetchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: any): void;
  WebSearchRequestNotify(query: string, maxResults?: number, searchEngine?: string, filters?: any, toolUseId?: string): void;
  WebSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: any): void;
}

/**
 * Chat notification functions for messaging
 */
export interface ChatNotifications {
  UserMessageRequestNotify(message: string, payload?: any, toolUseId?: string): void;
  AgentTextResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: any): void;
  GetChatHistoryRequestNotify(data?: any, toolUseId?: string): void;
  GetChatHistoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * Code utilities notification functions
 */
export interface CodeutilsNotifications {
  SearchRequestNotify(query: string, path?: string, filePattern?: string, caseSensitive?: boolean, toolUseId?: string): void;
  SearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GrepSearchRequestNotify(query: string, path?: string, includePattern?: string, excludePattern?: string, caseSensitive?: boolean, toolUseId?: string): void;
  GrepSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * Crawler notification functions for web crawling
 */
export interface CrawlerNotifications {
  CrawlRequestNotify(url: string, options?: any, toolUseId?: string): void;
  CrawlResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  SearchWebRequestNotify(query: string, options?: any, toolUseId?: string): void;
  SearchWebResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * Database memory notification functions
 */
export interface DbmemoryNotifications {
  StoreKnowledgeRequestNotify(key: string, value: any, toolUseId?: string): void;
  StoreKnowledgeResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  RetrieveKnowledgeRequestNotify(key: string, toolUseId?: string): void;
  RetrieveKnowledgeResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * File system notification functions
 */
export interface FsNotifications {
  FileCreateRequestNotify(fileName: string, source: string, filePath: string, toolUseId?: string): void;
  FileCreateResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  FolderCreateRequestNotify(folderName: string, folderPath: string, toolUseId?: string): void;
  FolderCreateResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  FileReadRequestNotify(filePath: string, startLine?: string, endLine?: string, toolUseId?: string): void;
  FileReadResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  FileEditRequestNotify(fileName: string, filePath: string, newContent: string, toolUseId?: string): void;
  FileEditResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  FileDeleteRequestNotify(fileName: string, filePath: string, toolUseId?: string): void;
  FileDeleteResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  FolderDeleteRequestNotify(folderName: string, folderPath: string, toolUseId?: string): void;
  FolderDeleteResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  ListDirectoryRequestNotify(dirPath: string, toolUseId?: string): void;
  ListDirectoryResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  WriteToFileRequestNotify(filePath: string, text: string, toolUseId?: string): void;
  WriteToFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  AppendToFileRequestNotify(filePath: string, text: string, toolUseId?: string): void;
  AppendToFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  CopyFileRequestNotify(sourceFile: string, destinationFile: string, toolUseId?: string): void;
  CopyFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  MoveFileRequestNotify(sourceFile: string, destinationFile: string, toolUseId?: string): void;
  MoveFileResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * Git notification functions
 */
export interface GitNotifications {
  GitInitRequestNotify(path?: string, toolUseId?: string): void;
  GitInitResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitPullRequestNotify(path?: string, toolUseId?: string): void;
  GitPullResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitPushRequestNotify(path?: string, toolUseId?: string): void;
  GitPushResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitStatusRequestNotify(path?: string, toolUseId?: string): void;
  GitStatusResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitAddRequestNotify(path?: string, files?: string[], toolUseId?: string): void;
  GitAddResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitCommitRequestNotify(path?: string, message?: string, toolUseId?: string): void;
  GitCommitResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitCheckoutRequestNotify(path?: string, branchName?: string, toolUseId?: string): void;
  GitCheckoutResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitBranchRequestNotify(path?: string, branchName?: string, toolUseId?: string): void;
  GitBranchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitLogsRequestNotify(path?: string, toolUseId?: string): void;
  GitLogsResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitDiffRequestNotify(path?: string, toolUseId?: string): void;
  GitDiffResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitRemoteAddRequestNotify(remoteName: string, remoteUrl: string, path?: string, toolUseId?: string): void;
  GitRemoteAddResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  GitCloneRequestNotify(repoUrl: string, targetPath?: string, toolUseId?: string): void;
  GitCloneResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * History notification functions
 */
export interface HistoryNotifications {
  SummarizeRequestNotify(messages?: any[], depth?: number, toolUseId?: string): void;
  SummarizeResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  SummarizeAllRequestNotify(toolUseId?: string): void;
  SummarizeAllResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * LLM notification functions
 */
export interface LlmNotifications {
  sendInferenceRequest(data: any, toolUseId?: string): void;
  sendInferenceResponse(content: string | any, isError?: boolean, toolUseId?: string): void;
  getTokenCount(data: any, toolUseId?: string): void;
  sendTokenCountResponse(content: string | any, isError?: boolean, toolUseId?: string, data?: any): void;
}

/**
 * MCP notification functions
 */
export interface McpNotifications {
  MCPExecuteRequestNotify(toolboxName: string, actualToolName: string, toolInput: any, toolUseId?: string): void;
  MCPExecuteResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  MCPListToolsRequestNotify(servers?: string[], toolUseId?: string): void;
  MCPListToolsResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * Search notification functions
 */
export interface SearchNotifications {
  SearchInitRequestNotify(toolUseId?: string): void;
  SearchInitResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  SearchQueryRequestNotify(query: string, options?: any, toolUseId?: string): void;
  SearchQueryResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * System notification functions
 */
export interface SystemNotifications {
  AgentInitializationRequestNotify(agentId?: string, toolUseId?: string): void;
  AgentInitializationResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
  AgentCompletionRequestNotify(agentId?: string, result?: any, toolUseId?: string): void;
}

/**
 * Terminal notification functions
 */
export interface TerminalNotifications {
  CommandExecutionRequestNotify(command: string, returnEmptyStringOnSuccess?: boolean, executeInMain?: boolean, toolUseId?: string): void;
  CommandExecutionResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * Todo notification functions
 */
export interface TodoNotifications {
  TaskOperationRequestNotify(operation: string, taskData?: any, toolUseId?: string): void;
  TaskOperationResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * Comprehensive notification module interface
 * Provides 15 categories of notification functions for the Codebolt SDK
 */
export interface NotificationModule {
  /** Agent notification functions for subagent task operations */
  agent: AgentNotifications;
  
  /** Browser notification functions for web operations */
  browser: BrowserNotifications;
  
  /** Chat notification functions for messaging */
  chat: ChatNotifications;
  
  /** Code utilities notification functions */
  codeutils: CodeutilsNotifications;
  
  /** Crawler notification functions for web crawling */
  crawler: CrawlerNotifications;
  
  /** Database memory notification functions */
  dbmemory: DbmemoryNotifications;
  
  /** File system notification functions */
  fs: FsNotifications;
  
  /** Git notification functions */
  git: GitNotifications;
  
  /** History notification functions */
  history: HistoryNotifications;
  
  /** LLM notification functions */
  llm: LlmNotifications;
  
  /** MCP notification functions */
  mcp: McpNotifications;
  
  /** Search notification functions */
  search: SearchNotifications;
  
  /** System notification functions */
  system: SystemNotifications;
  
  /** Terminal notification functions */
  terminal: TerminalNotifications;
  
  /** Todo notification functions */
  todo: TodoNotifications;
}

// ================================
// Additional Utility Modules
// ================================

export interface CrawlerModule {
  /**
   * Crawls a website
   * @param options - Crawler options
   */
  crawl(options: {
    url: string;
    maxDepth?: number;
    followExternal?: boolean;
    headers?: Record<string, string>;
    timeout?: number;
  }): Promise<APIResponse>;
}

export interface SearchModule {
  /**
   * Performs a search operation
   * @param query - Search query
   * @param options - Search options
   */
  search(query: string, options?: any): Promise<APIResponse>;
}

export interface TokenizerModule {
  /**
   * Tokenizes text
   * @param text - Text to tokenize
   * @param options - Tokenizer options
   */
  tokenize(text: string, options?: any): Promise<APIResponse>;

  /**
   * Counts tokens in text
   * @param text - Text to count tokens for
   */
  countTokens(text: string): Promise<APIResponse<number>>;
}

export interface EditFileAndApplyDiffSuccessResponse {
  type: 'editFileAndApplyDiffResponse';
  success: true;
  result: unknown;
}

export interface EditFileAndApplyDiffErrorResponse {
  type: 'editFileAndApplyDiffResponse';
  success: false;
  message: 'Failed to edit file and apply diff';
  result: string;
}

export type EditFileAndApplyDiffResponse = EditFileAndApplyDiffSuccessResponse | EditFileAndApplyDiffErrorResponse;

export interface UtilsModule {
  /**
   * Edits a file and applies a diff with AI assistance.
   * @param filePath - The path to the file to edit.
   * @param diff - The diff to apply.
   * @param diffIdentifier - The identifier for the diff.
   * @param prompt - The prompt for the AI model.
   * @param applyModel - Optional model to use for applying the diff.
   * @returns A promise that resolves with the edit response.
   */
  editFileAndApplyDiff(
    filePath: string,
    diff: string,
    diffIdentifier: string,
    prompt: string,
    applyModel?: string
  ): Promise<EditFileAndApplyDiffResponse>;
}

// ================================
// Chat Summary Module Types
// ================================

export interface ChatSummaryModule {
  /**
   * Summarizes the entire chat history
   */
  summarizeAll(): Promise<APIResponse<Array<{ role: string; content: string }>>>;

  /**
   * Summarizes a specific part of the chat history
   * @param messages - Array of message objects to summarize
   * @param depth - How far back in history to consider
   */
  summarize(messages: Array<{ role: string; content: string }>, depth: number): Promise<APIResponse<Array<{ role: string; content: string }>>>;
}

// ================================
// RAG Module Types
// ================================

export interface RAGModule {
  /**
   * Initializes the RAG system
   */
  init(): void;

  /**
   * Adds a file to the RAG system
   * @param filename - The name of the file to add
   * @param file_path - The path where the file should be added
   */
  add_file(filename: string, file_path: string): void;

  /**
   * Retrieves related knowledge for a given query and filename
   * @param query - The query to retrieve related knowledge for
   * @param filename - The name of the file associated with the query
   */
  retrieve_related_knowledge(query: string, filename: string): void;
}

// ================================
// Knowledge Module Types
// ================================

export interface KnowledgeModule {
  /**
   * Knowledge handling methods - currently placeholder
   * This module is extensible for future knowledge management features
   */
  [key: string]: any;
}

// ================================
// Code Parsers Module Types
// ================================

export interface ClassInfo {
  name: string;
  location: string;
}

export interface FunctionInfo {
  name: string;
  class?: string;
  location: string;
}

export interface CodeParsersModule {
  /**
   * Retrieves the classes in a given file
   * @param file - The file to parse for classes
   */
  getClassesInFile(file: string): Promise<ClassInfo[] | { error: string }>;

  /**
   * Retrieves the functions/methods in a specific class within a file
   * @param file - The file to parse for functions
   * @param className - The name of the class to search within
   */
  getFunctionsinClass(file: string, className: string): Promise<FunctionInfo[] | { error: string }>;

  /**
   * Generates an Abstract Syntax Tree (AST) for a given file
   * @param file - The file to generate an AST for
   * @param className - Optional class name to focus the AST generation on
   */
  getAstTreeInFile(file: string, className?: string): Promise<ASTNode | { error: string }>;
}

// ================================
// Output Parsers Module Types
// ================================

export interface ParseResult<T = any> {
  success: boolean;
  parsed?: T;
  error?: Error;
}

export interface OutputParsersModule {
  /**
   * Parses JSON string and returns a result object
   * @param jsonString - The JSON string to parse
   */
  parseJSON(jsonString: string): ParseResult<any>;

  /**
   * Parses XML string and returns a result object
   * @param xmlString - The XML string to parse
   */
  parseXML(xmlString: string): ParseResult<any>;

  /**
   * Parses CSV string and returns a result object
   * @param csvString - The CSV string to parse
   */
  parseCSV(csvString: string): ParseResult<any[]>;

  /**
   * Parses text string and returns a result object with lines
   * @param text - The text to parse
   */
  parseText(text: string): ParseResult<string[]>;

  /**
   * Parses the given output and returns all the error messages
   * @param output - The output to parse for error messages
   */
  parseErrors(output: any): string[];

  /**
   * Parses the given output and returns all the warning messages
   * @param output - The output to parse for warning messages
   */
  parseWarnings(output: any): string[];
}

// ================================
// Main Codebolt SDK Interface
// ================================

export interface CodeboltSDK {
  // Core properties
  websocket: WebSocket | null;
  ready: boolean;

  // Core methods
  waitForReady(): Promise<void>;
  onReady(handler: () => void | Promise<void>): void;
  onMessage(handler: (userMessage: UserMessage) => void | Promise<void> | any | Promise<any>): void;

  // Module interfaces
  fs: FileSystemModule;
  git: GitModule;
  llm: LLMModule;
  browser: BrowserModule;
  chat: ChatModule;
  terminal: TerminalModule;
  codeutils: CodeUtilsModule;
  crawler: CrawlerModule;
  search: SearchModule;
  knowledge: KnowledgeModule;
  rag: RAGModule;
  codeparsers: CodeParsersModule;
  outputparsers: OutputParsersModule;
  project: ProjectModule;
  dbmemory: MemoryModule;
  cbstate: StateModule;
  taskplaner: TaskModule;
  vectordb: VectorDBModule;
  debug: DebugModule;
  tokenizer: TokenizerModule;
  chatSummary: ChatSummaryModule;
  mcp: MCPModule;
  agent: AgentModule;
  utils: UtilsModule;
  notify: NotificationModule;
}

// ================================
// Default Export - Main SDK Type
// ================================

/**
 * Main Codebolt SDK instance type
 * This represents the default exported instance from the codeboltjs library
 */
export type CodeboltInstance = CodeboltSDK;

/**
 * Codebolt class constructor type
 * This represents the Codebolt class itself for advanced users
 */
export interface CodeboltConstructor {
  new(): CodeboltSDK;
}

// ================================
// ComposableAgent Types
// ================================

/**
 * CodeBolt message format for ComposableAgent
 */
export interface CodeBoltMessage {
  /** The actual text content of the user message */
  userMessage: string;
  /** Optional list of files mentioned in the message */
  mentionedFiles?: string[];
  /** List of MCP (Model Context Protocol) tools mentioned */
  mentionedMCPs: { toolbox: string, toolName: string }[];
  /** List of agents mentioned in the message */
  mentionedAgents: any[];
  /** Remix prompt for enhanced instructions */
  remixPrompt?: string;
}

/**
 * Model provider configuration
 */
export interface ModelProvider {
  /** Model identifier (e.g., 'gpt-4o-mini', 'claude-3-sonnet') */
  model: string;
  /** Provider name (e.g., 'openai', 'anthropic') */
  provider: string;
  /** Provider-specific configuration */
  config?: Record<string, any>;
}

/**
 * Tool configuration for ComposableAgent
 */
export interface ToolConfig<TInput = any, TOutput = any> {
  /** Unique identifier for the tool */
  id: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** Zod schema for input validation */
  inputSchema: any; // z.ZodType<TInput>
  /** Zod schema for output validation */
  outputSchema: any; // z.ZodType<TOutput>
  /** Tool execution function */
  execute: (params: { context: TInput; agent?: any }) => Promise<TOutput>;
}

/**
 * Tool interface for ComposableAgent
 */
export interface Tool<TInput = any, TOutput = any> extends ToolConfig<TInput, TOutput> {
  /** Validates input against the schema */
  validateInput: (input: unknown) => TInput;
  /** Validates output against the schema */
  validateOutput: (output: unknown) => TOutput;
}

/**
 * Storage provider interface
 */
export interface StorageProvider {
  /** Get value by key */
  get(key: string): Promise<any>;
  /** Set value by key */
  set(key: string, value: any): Promise<void>;
  /** Delete value by key */
  delete(key: string): Promise<void>;
  /** List all keys */
  keys(): Promise<string[]>;
  /** Clear all data */
  clear(): Promise<void>;
}

/**
 * LibSQL store configuration
 */
export interface LibSQLStoreConfig {
  /** Database URL or file path */
  url: string;
  /** Optional authentication token */
  authToken?: string;
  /** Table name for storage */
  tableName?: string;
}

/**
 * Memory configuration
 */
export interface MemoryConfig {
  /** Storage provider for persistence */
  storage: StorageProvider;
  /** Maximum number of messages to keep in memory */
  maxMessages?: number;
  /** Whether to auto-save conversation history */
  autoSave?: boolean;
}

/**
 * Memory interface
 */
export interface Memory {
  /** Save messages to storage */
  saveMessages(messages: Message[], key?: string): Promise<void>;
  /** Load messages from storage */
  loadMessages(key?: string): Promise<Message[]>;
  /** Add a message to conversation */
  addMessage(message: Message, messages: Message[], save?: boolean): Promise<Message[]>;
  /** Clear conversation history */
  clearMessages(key?: string): Promise<void>;
  /** Get storage provider */
  getStorage(): StorageProvider;
  /** Set conversation key */
  setConversationKey(key: string): void;
  /** List all conversations */
  listConversations(): Promise<string[]>;
}

/**
 * Agent processing configuration
 */
export interface AgentProcessingConfig {
  /** Whether to process mentioned MCPs and make them available as tools */
  processMentionedMCPs?: boolean;
  /** Whether to use remix prompt to enhance system instructions */
  processRemixPrompt?: boolean;
  /** Whether to process mentioned files and include their content */
  processMentionedFiles?: boolean;
  /** Whether to process mentioned agents and make them available as sub-agents */
  processMentionedAgents?: boolean;
  /** Custom file content processor */
  fileContentProcessor?: (filePath: string) => Promise<string>;
  /** Custom MCP tool processor */
  mcpToolProcessor?: (toolbox: string, toolName: string) => Promise<Tool | null>;
}

/**
 * ComposableAgent configuration
 */
export interface ComposableAgentConfig {
  /** Agent name/identifier */
  name: string;
  /** System instructions for the agent */
  instructions: string;
  /** Model provider configuration */
  model: ModelProvider;
  /** Available tools for the agent */
  tools?: Record<string, Tool>;
  /** Memory instance */
  memory?: Memory;
  /** Maximum conversation turns */
  maxTurns?: number;
  /** Processing configuration for CodeBolt features */
  processing?: AgentProcessingConfig;
  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Message content types
 */
export interface MessageContent {
  /** Content type */
  type: 'text' | 'image' | 'file';
  /** Text content */
  text?: string;
  /** Image URL or data */
  image_url?: string;
  /** File path or data */
  file?: string;
}

/**
 * Execution result
 */
export interface ExecutionResult {
  /** Whether execution was successful */
  success: boolean;
  /** Final assistant message */
  message?: string;
  /** Error message if failed */
  error?: string;
  /** Full conversation history */
  conversation: Message[];
  /** Execution metadata */
  metadata?: Record<string, any>;
}

/**
 * Stream chunk for streaming responses
 */
export interface StreamChunk {
  /** Chunk type */
  type: 'text' | 'tool_call' | 'tool_result' | 'error';
  /** Chunk content */
  content: string;
  /** Associated tool call if applicable */
  tool_call?: ToolCall;
  /** Chunk metadata */
  metadata?: Record<string, any>;
}

/**
 * Stream callback type
 */
export type StreamCallback = (chunk: StreamChunk) => void | Promise<void>;

/**
 * ComposableAgent interface
 */
export interface ComposableAgent {
  /** Agent configuration */
  readonly config: ComposableAgentConfig;
  /** Execute a task with the agent using string message */
  execute(message: string, options?: { stream?: boolean; callback?: StreamCallback }): Promise<ExecutionResult>;
  /** Execute a task with the agent using CodeBolt Message format */
  executeMessage(message: CodeBoltMessage, options?: { stream?: boolean; callback?: StreamCallback }): Promise<ExecutionResult>;
  /** Run the agent using globally saved user context */
  run(options?: { stream?: boolean; callback?: StreamCallback }): Promise<ExecutionResult>;
  /** Add a message to the conversation */
  addMessage(message: Message): void;
  /** Get conversation history */
  getConversation(): Message[];
  /** Clear conversation history */
  clearConversation(): void;
  /** Save conversation to memory */
  saveConversation(): Promise<void>;
  /** Load conversation from memory */
  loadConversation(): Promise<void>;
}

/**
 * Document configuration
 */
export interface DocumentConfig {
  /** Document content */
  content: string;
  /** Document type/format */
  type?: 'text' | 'markdown' | 'json' | 'xml';
  /** Document metadata */
  metadata?: Record<string, any>;
}

/**
 * Processed document
 */
export interface ProcessedDocument {
  /** Original content */
  content: string;
  /** Processed/chunked content */
  chunks?: string[];
  /** Document metadata */
  metadata: Record<string, any>;
  /** Document embeddings if processed */
  embeddings?: number[][];
}

// ================================
// Workflow Types
// ================================

/**
 * Workflow context
 */
export interface WorkflowContext {
  /** Shared data between workflow steps */
  data: Record<string, any>;
  /** Execution history */
  history: WorkflowStepResult[];
  /** Current step index */
  currentStep: number;
  /** Workflow metadata */
  metadata: Record<string, any>;
}

/**
 * Workflow step result
 */
export interface WorkflowStepResult {
  /** Step ID */
  stepId: string;
  /** Whether step succeeded */
  success: boolean;
  /** Step output data */
  output?: any;
  /** Error message if failed */
  error?: string;
  /** Step execution time */
  executionTime: number;
  /** Step metadata */
  metadata?: Record<string, any>;
}

/**
 * Workflow step configuration
 */
export interface WorkflowStep {
  /** Unique step identifier */
  id: string;
  /** Human-readable step name */
  name: string;
  /** Step description */
  description?: string;
  /** Input schema validation */
  inputSchema?: any; // z.ZodType
  /** Output schema validation */
  outputSchema?: any; // z.ZodType
  /** Step execution function */
  execute: (context: WorkflowContext) => Promise<WorkflowStepResult>;
  /** Condition to determine if step should run */
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>;
  /** Steps that must complete before this step */
  dependencies?: string[];
  /** Whether step can run in parallel */
  parallel?: boolean;
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
}

/**
 * Workflow configuration
 */
export interface WorkflowConfig {
  /** Workflow name */
  name: string;
  /** Workflow description */
  description?: string;
  /** Workflow steps */
  steps: WorkflowStep[];
  /** Initial context data */
  initialData?: Record<string, any>;
  /** Workflow timeout in milliseconds */
  timeout?: number;
  /** Whether to continue on step failure */
  continueOnError?: boolean;
  /** Maximum parallel steps */
  maxParallelSteps?: number;
}

/**
 * Workflow result
 */
export interface WorkflowResult {
  /** Whether workflow completed successfully */
  success: boolean;
  /** Final context data */
  data: Record<string, any>;
  /** All step results */
  stepResults: WorkflowStepResult[];
  /** Total execution time */
  executionTime: number;
  /** Error message if failed */
  error?: string;
  /** Workflow metadata */
  metadata: Record<string, any>;
}

/**
 * Agent step configuration for workflows
 */
export interface AgentStepConfig {
  /** Agent instance to execute */
  agent: ComposableAgent;
  /** Message template (can use context variables) */
  messageTemplate: string;
  /** Input mapping from context */
  inputMapping?: Record<string, string>;
  /** Output mapping to context */
  outputMapping?: Record<string, string>;
}

// ================================
// Additional Type Exports
// ================================

// All types are already exported above with their definitions
// This ensures proper TypeScript module resolution and prevents conflicts