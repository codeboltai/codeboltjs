/**
 * TypeScript types for the public API functions exported by the codeboltjs library
 * 
 * This file contains types for:
 * - Public function parameters and return types
 * - API interfaces exposed to library users
 * - Configuration options for library functions
 * - User-facing data structures
 */

// ================================
// Message Types for Library API
// ================================

/**
 * Content block within a message
 */
export interface MessageContentBlock {
  /** Type of content block */
  type: 'text' | 'image' | 'file' | 'code' | 'error' | 'tool_result';
  /** Text content for text blocks */
  text?: string;
  /** Image URL for image blocks */
  image_url?: string;
  /** File information for file blocks */
  file?: {
    name: string;
    path: string;
    size?: number;
    type?: string;
  };
  /** Code information for code blocks */
  code?: {
    language: string;
    code: string;
    filename?: string;
  };
  /** Error information for error blocks */
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  /** Tool result for tool_result blocks */
  tool_result?: {
    tool_name: string;
    result: unknown;
    success: boolean;
  };
}

/**
 * Represents a message in the conversation with roles and content.
 */
export interface Message {
  /** The role of the message sender: user, assistant, tool, or system */
  role: 'user' | 'assistant' | 'tool' | 'system';
  /** The content of the message, can be an array of content blocks or a string */
  content: MessageContentBlock[] | string;
  /** Optional ID for tool calls */
  tool_call_id?: string;
  /** Optional tool calls for assistant messages */
  tool_calls?: ToolCall[];
  /** Additional properties that might be present */
  [key: string]: unknown;
}

/**
 * Represents a tool call in OpenAI format
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string;
  /** The type of tool call */
  type: 'function';
  /** Function call details */
  function: {
    /** Name of the function to call */
    name: string;
    /** Arguments for the function call as JSON string */
    arguments: string;
  };
}

/**
 * JSON Schema for tool parameters
 */
export interface JSONSchema {
  /** Schema type */
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'integer';
  /** Schema description */
  description?: string;
  /** Required properties for objects */
  required?: string[];
  /** Properties for objects */
  properties?: Record<string, JSONSchema>;
  /** Items for arrays */
  items?: JSONSchema;
  /** Enum values */
  enum?: unknown[];
  /** Minimum value for numbers */
  minimum?: number;
  /** Maximum value for numbers */
  maximum?: number;
  /** Pattern for strings */
  pattern?: string;
  /** Format for strings */
  format?: string;
  /** Additional properties allowed */
  additionalProperties?: boolean | JSONSchema;
}

/**
 * Represents a tool definition in OpenAI format
 */
export interface Tool {
  /** The type of tool */
  type: 'function';
  /** Function definition */
  function: {
    /** Name of the function */
    name: string;
    /** Description of what the function does */
    description?: string;
    /** JSON schema for the function parameters */
    parameters?: JSONSchema;
  };
}

/**
 * LLM inference request parameters
 */
export interface LLMInferenceParams {
  /** Array of messages in the conversation */
  messages: Message[];
  /** Available tools for the model to use */
  tools?: Tool[];
  /** How the model should use tools */
  tool_choice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
  /** The LLM role to determine which model to use */
  llmrole: string;
  /** Maximum number of tokens to generate */
  max_tokens?: number;
  /** Temperature for response generation */
  temperature?: number;
  /** Whether to stream the response */
  stream?: boolean;
}

// ================================
// OpenAI Compatible Types
// ================================

/**
 * OpenAI-compatible message format for conversations
 */
export interface OpenAIMessage {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant' | 'tool';
  /** Content of the message */
  content: string | Array<{ type: string; text: string }>;
  /** Tool call ID for tool messages */
  tool_call_id?: string;
  /** Tool calls for assistant messages */
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

/**
 * OpenAI-compatible tool format
 */
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description: string;
      }>;
      required?: string[];
      additionalProperties?: boolean;
    };
    strict?: boolean;
  };
}

/**
 * Conversation history entry for agent interactions
 */
export interface ConversationEntry {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{ type: string; text: string }>;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

/**
 * Result from a tool execution
 */
export interface ToolResult {
  /** Always 'tool' for tool execution results */
  role: 'tool';
  /** ID that links this result to the original tool call */
  tool_call_id: string;
  /** The content returned by the tool */
  content: string | Record<string, unknown>;
  /** Optional user message to be added after tool execution */
  userMessage?: string | Record<string, unknown>;
}

/**
 * Details about a tool to be executed
 */
export interface ToolDetails {
  /** The name of the tool to execute */
  toolName: string;
  /** Input parameters for the tool */
  toolInput: Record<string, unknown>;
  /** Unique ID for this tool use instance */
  toolUseId: string;
}

/**
 * Content block within a user message
 */
export interface UserMessageContent {
  /** Type of content (e.g., "text", "image") */
  type: string;
  /** The text content */
  text: string;
}

/**
 * User message received from the Codebolt platform
 * This is a simplified, user-friendly version of the internal message format
 */
export interface UserMessage {
  type: string;
  /** The user's message content */
  userMessage: string;
  /** Current file being worked on */
  currentFile: string;
  /** Files mentioned in the message */
  mentionedFiles: string[];
  /** Full file paths mentioned */
  mentionedFullPaths: string[];
  /** MCPs mentioned */
  mentionedMCPs: string[];
  /** Folders mentioned */
  mentionedFolders: string[];
  /** Images uploaded with the message */
  uploadedImages: string[];
  /** Selected agent information */
  selectedAgent: {
    id: string;
    name: string;
  };
  /** Unique message identifier */
  messageId: string;
  /** Thread identifier */
  threadId: string;
  /** Any text selection in the editor */
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  remixPrompt?: string;
  mentionedAgents?: string[];
}

/**
 * Interface for codebolt API functionality
 */
export interface CodeboltAPI {
  mcp: {
    listMcpFromServers: (servers: string[]) => Promise<{ data: OpenAITool[] }>;
    getTools: (mcps: string[]) => Promise<{ data: OpenAITool[] }>;
    executeTool: (toolboxName: string, actualToolName: string, toolInput: Record<string, unknown>) => Promise<{ data: string | Record<string, unknown> }>;
  };
  fs: {
    readFile: (filepath: string) => Promise<string>;
    listFile: (path: string, recursive: boolean) => Promise<{ success: boolean; result: string }>;
  };
  project: {
    getProjectPath: () => Promise<{ projectPath: string }>;
  };
  chat: {
    sendMessage: (message: string, metadata: Record<string, unknown>) => Promise<void>;
  };
}

// ================================
// File System API Types
// ================================

export interface ReadFileOptions {
  /** File path to read */
  path: string;
  /** Text encoding (default: utf8) */
  encoding?: string;
  /** Whether to ask for permission before reading */
  askForPermission?: boolean;
}

export interface WriteFileOptions {
  /** File path to write to */
  path: string;
  /** Content to write */
  content: string;
  /** Text encoding (default: utf8) */
  encoding?: string;
  /** Whether to ask for permission before writing */
  askForPermission?: boolean;
}

export interface ListFilesOptions {
  /** Directory path to list */
  path: string;
  /** Whether to list files recursively */
  recursive?: boolean;
}

export interface SearchFilesOptions {
  /** Search query/pattern */
  query: string;
  /** Directory to search in */
  path?: string;
  /** File pattern to include (glob) */
  filePattern?: string;
  /** Whether search is case sensitive */
  caseSensitive?: boolean;
}

export interface GrepSearchOptions {
  /** Search pattern */
  query: string;
  /** Directory to search in */
  path?: string;
  /** Include pattern (glob) */
  includePattern?: string;
  /** Exclude pattern (glob) */
  excludePattern?: string;
  /** Whether search is case sensitive */
  caseSensitive?: boolean;
}

// ================================
// File System Response Types
// ================================

/**
 * File information structure
 */
export interface FileInfo {
  /** File or directory name */
  name: string;
  /** Full path to the file or directory */
  path: string;
  /** Whether this is a directory */
  isDirectory: boolean;
  /** File size in bytes */
  size?: number;
  /** Last modified timestamp */
  modified?: string;
  /** Creation timestamp */
  created?: string;
  /** File permissions */
  permissions?: string;
  /** File extension */
  extension?: string;
}

/**
 * Search match information
 */
export interface SearchMatch {
  /** Line number where match was found */
  line: number;
  /** Content of the line */
  content: string;
  /** Line number (alias for line) */
  lineNumber: number;
  /** Column where match starts */
  column?: number;
  /** Length of the match */
  matchLength?: number;
}

/**
 * File search result
 */
export interface FileSearchResult {
  /** Path to the file */
  path: string;
  /** Matches found in the file */
  matches: SearchMatch[];
  /** Relevance score for fuzzy search */
  score?: number;
}

/**
 * Grep search result
 */
export interface GrepSearchResult {
  /** Path to the file */
  file: string;
  /** Line number where match was found */
  line: number;
  /** Content of the line */
  content: string;
  /** The actual match text */
  match: string;
  /** Column where match starts */
  column?: number;
  /** Context lines before and after */
  context?: {
    before: string[];
    after: string[];
  };
}

/**
 * Code definition information
 */
export interface CodeDefinition {
  /** Name of the definition */
  name: string;
  /** Type of definition (function, class, variable, etc.) */
  type: string;
  /** File path where definition is located */
  file: string;
  /** Line number where definition starts */
  line: number;
  /** Column where definition starts */
  column?: number;
  /** Scope of the definition */
  scope?: string;
  /** Documentation comment if available */
  documentation?: string;
}

/**
 * Diff result information
 */
export interface DiffResult {
  /** Status of the diff operation */
  status: 'success' | 'error' | 'review_started' | 'rejected';
  /** File that was modified */
  file: string;
  /** Result message */
  message: string;
  /** Diff content if available */
  diff?: string;
  /** Applied changes summary */
  changes?: {
    added: number;
    removed: number;
    modified: number;
  };
}

/**
 * Base response interface for all FS operations
 */
export interface BaseFSResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response data - specific to each operation type */
  data?: FileInfo[] | FileSearchResult[] | GrepSearchResult[] | CodeDefinition[] | DiffResult | string | number | boolean | Record<string, unknown>;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Create file response types
 */
export interface CreateFileSuccessResponse extends BaseFSResponse {
  type: 'createFileResponse';
  success: true;
}

export interface CreateFileErrorResponse extends BaseFSResponse {
  type: 'createFileResponse';
  success: false;
  error: string;
}

/**
 * Create folder response types
 */
export interface CreateFolderSuccessResponse extends BaseFSResponse {
  type: 'createFolderResponse';
  success: true;
}

export interface CreateFolderErrorResponse extends BaseFSResponse {
  type: 'createFolderResponse';
  success: false;
  error: string;
}

/**
 * Read file response types
 */
export interface ReadFileSuccessResponse extends BaseFSResponse {
  type: 'readFileResponse';
  success: true;
  /** File content */
  content?: string;
}

export interface ReadFileErrorResponse extends BaseFSResponse {
  type: 'readFileResponse';
  success: false;
  error: string;
}

/**
 * Update file response types
 */
export interface UpdateFileSuccessResponse extends BaseFSResponse {
  type: 'updateFileResponse';
  success: true;
}

export interface UpdateFileErrorResponse extends BaseFSResponse {
  type: 'updateFileResponse';
  success: false;
  error: string;
}

/**
 * Delete file response types
 */
export interface DeleteFileSuccessResponse extends BaseFSResponse {
  type: 'deleteFileResponse';
  success: true;
}

export interface DeleteFileErrorResponse extends BaseFSResponse {
  type: 'deleteFileResponse';
  success: false;
  error: string;
}

/**
 * Delete folder response types
 */
export interface DeleteFolderSuccessResponse extends BaseFSResponse {
  type: 'deleteFolderResponse';
  success: true;
}

export interface DeleteFolderErrorResponse extends BaseFSResponse {
  type: 'deleteFolderResponse';
  success: false;
  error: string;
}

/**
 * File list response types
 */
export interface FileListSuccessResponse extends BaseFSResponse {
  type: 'fileListResponse';
  success: true;
  /** Array of file information */
  files?: FileInfo[];
}

export interface FileListErrorResponse extends BaseFSResponse {
  type: 'fileListResponse';
  success: false;
  error: string;
}

/**
 * Search files response types
 */
export interface SearchFilesSuccessResponse extends BaseFSResponse {
  type: 'searchFilesResponse';
  success: true;
  /** Search results */
  files?: FileSearchResult[];
}

export interface SearchFilesErrorResponse extends BaseFSResponse {
  type: 'searchFilesResponse';
  success: false;
  error: string;
}

/**
 * Write to file response types
 */
export interface WriteToFileSuccessResponse extends BaseFSResponse {
  type: 'writeToFileResponse';
  success: true;
}

export interface WriteToFileErrorResponse extends BaseFSResponse {
  type: 'writeToFileResponse';
  success: false;
  error: string;
}

/**
 * Grep search response types
 */
export interface GrepSearchSuccessResponse extends BaseFSResponse {
  type: 'grepSearchResponse';
  success: true;
  /** Search results */
  results?: GrepSearchResult[];
}

export interface GrepSearchErrorResponse extends BaseFSResponse {
  type: 'grepSearchResponse';
  success: false;
  error: string;
}

/**
 * File search response types
 */
export interface FileSearchSuccessResponse extends BaseFSResponse {
  type: 'fileSearchResponse';
  success: true;
  /** Array of matching file paths */
  files?: string[];
}

export interface FileSearchErrorResponse extends BaseFSResponse {
  type: 'fileSearchResponse';
  success: false;
  error: string;
}

/**
 * List code definition names response types
 */
export interface ListCodeDefinitionNamesSuccessResponse extends BaseFSResponse {
  type: 'listCodeDefinitionNamesResponse';
  success: true;
  /** Array of code definition names */
  definitions?: string[];
  /** Detailed code definition information */
  codeDefinitions?: CodeDefinition[];
}

export interface ListCodeDefinitionNamesErrorResponse extends BaseFSResponse {
  type: 'listCodeDefinitionNamesResponse';
  success: false;
  error: string;
}

/**
 * Edit file with diff response types
 */
export interface EditFileAndApplyDiffSuccessResponse extends BaseFSResponse {
  type: 'editFileAndApplyDiffResponse';
  success: true;
  /** Diff result information */
  data?: DiffResult;
}

export interface EditFileAndApplyDiffErrorResponse extends BaseFSResponse {
  type: 'editFileAndApplyDiffResponse';
  success: false;
  error: string;
}

/**
 * Union type for all FS responses
 */
export type FSResponse = 
  | CreateFileSuccessResponse | CreateFileErrorResponse
  | CreateFolderSuccessResponse | CreateFolderErrorResponse
  | ReadFileSuccessResponse | ReadFileErrorResponse
  | UpdateFileSuccessResponse | UpdateFileErrorResponse
  | DeleteFileSuccessResponse | DeleteFileErrorResponse
  | DeleteFolderSuccessResponse | DeleteFolderErrorResponse
  | FileListSuccessResponse | FileListErrorResponse
  | SearchFilesSuccessResponse | SearchFilesErrorResponse
  | WriteToFileSuccessResponse | WriteToFileErrorResponse
  | GrepSearchSuccessResponse | GrepSearchErrorResponse
  | FileSearchSuccessResponse | FileSearchErrorResponse
  | ListCodeDefinitionNamesSuccessResponse | ListCodeDefinitionNamesErrorResponse
  | EditFileAndApplyDiffSuccessResponse | EditFileAndApplyDiffErrorResponse;

/**
 * File system operation parameters
 */
export interface CreateFileParams {
  /** File name to create */
  fileName: string;
  /** Source content for the file */
  source: string;
  /** Path where to create the file */
  filePath: string;
}

export interface CreateFolderParams {
  /** Folder name to create */
  folderName: string;
  /** Path where to create the folder */
  folderPath: string;
}

export interface ReadFileParams {
  /** Path of the file to read */
  filePath: string;
}

export interface UpdateFileParams {
  /** Name of the file to update */
  filename: string;
  /** Path of the file to update */
  filePath: string;
  /** New content for the file */
  newContent: string;
}

export interface DeleteFileParams {
  /** Name of the file to delete */
  filename: string;
  /** Path of the file to delete */
  filePath: string;
}

export interface DeleteFolderParams {
  /** Name of the folder to delete */
  foldername: string;
  /** Path of the folder to delete */
  folderpath: string;
}

export interface ListFileParams {
  /** Path to list files from */
  folderPath: string;
  /** Whether to list files recursively */
  isRecursive?: boolean;
}

export interface ListCodeDefinitionNamesParams {
  /** Path to search for code definitions */
  path: string;
}

export interface SearchFilesParams {
  /** Path to search within */
  path: string;
  /** Regex pattern to search for */
  regex: string;
  /** File pattern to match files */
  filePattern: string;
}

export interface WriteToFileParams {
  /** Relative path of the file to write to */
  relPath: string;
  /** New content to write into the file */
  newContent: string;
}

export interface GrepSearchParams {
  /** Path to search within */
  path: string;
  /** Query to search for */
  query: string;
  /** Pattern of files to include */
  includePattern?: string;
  /** Pattern of files to exclude */
  excludePattern?: string;
  /** Whether the search is case sensitive */
  caseSensitive?: boolean;
}

export interface FileSearchParams {
  /** Query to search for */
  query: string;
}

export interface EditFileWithDiffParams {
  /** Target file to edit */
  target_file: string;
  /** Code edit to apply */
  code_edit: string;
  /** Diff identifier */
  diffIdentifier: string;
  /** Prompt for the edit */
  prompt: string;
  /** Model to apply the edit with */
  applyModel?: string;
}

// ================================
// Browser API Types
// ================================

/**
 * Browser viewport information
 */
export interface BrowserViewportInfo {
  /** Viewport width */
  width: number;
  /** Viewport height */
  height: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
  /** Horizontal scroll position */
  scrollX: number;
  /** Vertical scroll position */
  scrollY: number;
  /** Page Y offset */
  pageYOffset: number;
  /** Page X offset */
  pageXOffset: number;
  /** Window width */
  windowWidth: number;
  /** Window height */
  windowHeight: number;
  /** Offset height */
  offsetHeight: number;
  /** Scroll height */
  scrollHeight: number;
}

/**
 * Browser element information
 */
export interface BrowserElement {
  /** Element ID */
  id: string;
  /** HTML tag name */
  tag: string;
  /** Element text content */
  text: string;
  /** Element attributes */
  attributes: Record<string, string>;
}

/**
 * Browser snapshot tree structure
 */
export interface BrowserSnapshotTree {
  /** Array of strings */
  strings: string[];
  /** Document nodes */
  documents: Array<{
    nodes: {
      backendNodeId: number[];
      attributes: Array<{ name: string; value: string }>;
      nodeValue: string[];
      parentIndex: number[];
      nodeType: number[];
      nodeName: string[];
      isClickable: { index: number[] };
      textValue: { index: number[]; value: string[] };
      inputValue: { index: number[]; value: string[] };
      inputChecked: { index: number[] };
    };
  }>;
}

/**
 * Browser action payload
 */
export interface BrowserActionPayload {
  /** Action type */
  action?: string;
  /** Success status */
  success?: boolean;
  /** Content text */
  content?: string;
  /** HTML content */
  html?: string;
  /** Markdown content */
  markdown?: string;
  /** Text content */
  text?: string;
  /** URL */
  url?: string;
  /** Viewport information */
  viewport?: BrowserViewportInfo;
  /** Browser info */
  info?: BrowserViewportInfo;
  /** DOM tree snapshot */
  tree?: BrowserSnapshotTree;
  /** Screenshot data */
  screenshot?: string;
  /** PDF data */
  pdf?: Buffer | string;
  /** Page elements */
  elements?: BrowserElement[];
  /** CSS selector */
  selector?: string;
  /** Full page flag */
  fullPage?: boolean;
  /** Additional options */
  options?: Record<string, unknown>;
}

/**
 * Browser navigation result
 */
export interface BrowserNavigationResult {
  /** Target URL */
  url: string;
  /** Success status */
  success: boolean;
  /** Navigation message */
  message?: string;
  /** Page title */
  title?: string;
}

/**
 * Browser screenshot result
 */
export interface BrowserScreenshotResult {
  /** Screenshot data */
  screenshot: string;
  /** Full page flag */
  fullPage?: boolean;
  /** Image format */
  format?: 'png' | 'jpeg';
  /** Image quality */
  quality?: number;
  /** Viewport info */
  viewport?: BrowserViewportInfo;
}

/**
 * Browser content result
 */
export interface BrowserContentResult {
  /** Content text */
  content?: string;
  /** HTML content */
  html?: string;
  /** Markdown content */
  markdown?: string;
  /** Text content */
  text?: string;
  /** URL */
  url?: string;
  /** Page title */
  title?: string;
}

/**
 * Browser element interaction result
 */
export interface BrowserElementInteractionResult {
  /** Success status */
  success: boolean;
  /** Element selector */
  selector: string;
  /** Interaction message */
  message?: string;
  /** Element found */
  element?: BrowserElement;
}

// ================================
// Browser Response Types
// ================================

/**
 * Base response interface for all Browser operations
 */
export interface BaseBrowserResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response payload */
  payload?: BrowserActionPayload;
  /** Event identifier */
  eventId?: string;
  /** Response data - specific to each operation type */
  data?: BrowserNavigationResult | BrowserScreenshotResult | BrowserContentResult | BrowserElementInteractionResult | string | number | boolean | Record<string, unknown>;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Browser new page response types
 */
export interface BrowserNewPageSuccessResponse extends BaseBrowserResponse {
  type: 'newPageResponse';
  success: true;
  /** New page result data */
  data?: BrowserNavigationResult;
}

export interface BrowserNewPageErrorResponse extends BaseBrowserResponse {
  type: 'newPageResponse';
  success: false;
  error: string;
}

/**
 * Browser navigation response types
 */
export interface BrowserGoToPageSuccessResponse extends BaseBrowserResponse {
  type: 'goToPageResponse';
  success: true;
  /** Navigation result data */
  data?: BrowserNavigationResult;
}

export interface BrowserGoToPageErrorResponse extends BaseBrowserResponse {
  type: 'goToPageResponse';
  success: false;
  error: string;
}

/**
 * Browser URL response types
 */
export interface BrowserGetUrlSuccessResponse extends BaseBrowserResponse {
  type: 'getUrlResponse';
  success: true;
  /** Current URL */
  url?: string;
  /** Current URL data */
  data?: { url: string; currentUrl: string };
}

export interface BrowserGetUrlErrorResponse extends BaseBrowserResponse {
  type: 'getUrlResponse';
  success: false;
  error: string;
}

/**
 * Browser screenshot response types
 */
export interface BrowserScreenshotSuccessResponse extends BaseBrowserResponse {
  type: 'screenshotResponse';
  success: true;
  /** Screenshot result data */
  data?: BrowserScreenshotResult;
}

export interface BrowserScreenshotErrorResponse extends BaseBrowserResponse {
  type: 'screenshotResponse';
  success: false;
  error: string;
}

/**
 * Browser HTML response types
 */
export interface BrowserGetHtmlSuccessResponse extends BaseBrowserResponse {
  type: 'getHTMLResponse';
  success: true;
  /** HTML content result data */
  data?: BrowserContentResult;
}

export interface BrowserGetHtmlErrorResponse extends BaseBrowserResponse {
  type: 'getHTMLResponse';
  success: false;
  error: string;
}

/**
 * Browser markdown response types
 */
export interface BrowserGetMarkdownSuccessResponse extends BaseBrowserResponse {
  type: 'getMarkdownResponse';
  success: true;
  /** Markdown content result data */
  data?: BrowserContentResult;
}

export interface BrowserGetMarkdownErrorResponse extends BaseBrowserResponse {
  type: 'getMarkdownResponse';
  success: false;
  error: string;
}

/**
 * Browser content response types
 */
export interface BrowserGetContentSuccessResponse extends BaseBrowserResponse {
  type: 'getContentResponse';
  success: true;
  /** Content result data */
  data?: BrowserContentResult;
}

export interface BrowserGetContentErrorResponse extends BaseBrowserResponse {
  type: 'getContentResponse';
  success: false;
  error: string;
}

/**
 * Browser text extraction response types
 */
export interface BrowserExtractTextSuccessResponse extends BaseBrowserResponse {
  type: 'extractTextResponse';
  success: true;
  /** Text extraction result data */
  data?: BrowserContentResult;
}

export interface BrowserExtractTextErrorResponse extends BaseBrowserResponse {
  type: 'extractTextResponse';
  success: false;
  error: string;
}

/**
 * Browser element interaction response types
 */
export interface BrowserClickSuccessResponse extends BaseBrowserResponse {
  type: 'clickResponse';
  success: true;
  /** Click result data */
  data?: BrowserElementInteractionResult;
}

export interface BrowserClickErrorResponse extends BaseBrowserResponse {
  type: 'clickResponse';
  success: false;
  error: string;
}

export interface BrowserTypeSuccessResponse extends BaseBrowserResponse {
  type: 'typeResponse';
  success: true;
  /** Type result data */
  data?: BrowserElementInteractionResult;
}

export interface BrowserTypeErrorResponse extends BaseBrowserResponse {
  type: 'typeResponse';
  success: false;
  error: string;
}

export interface BrowserScrollSuccessResponse extends BaseBrowserResponse {
  type: 'scrollResponse';
  success: true;
  /** Scroll result data */
  data?: { success: boolean; viewport?: BrowserViewportInfo };
}

export interface BrowserScrollErrorResponse extends BaseBrowserResponse {
  type: 'scrollResponse';
  success: false;
  error: string;
}

/**
 * Union type for all Browser responses
 */
export type BrowserResponse = 
  | BrowserNewPageSuccessResponse | BrowserNewPageErrorResponse
  | BrowserGoToPageSuccessResponse | BrowserGoToPageErrorResponse
  | BrowserGetUrlSuccessResponse | BrowserGetUrlErrorResponse
  | BrowserScreenshotSuccessResponse | BrowserScreenshotErrorResponse
  | BrowserGetHtmlSuccessResponse | BrowserGetHtmlErrorResponse
  | BrowserGetMarkdownSuccessResponse | BrowserGetMarkdownErrorResponse
  | BrowserGetContentSuccessResponse | BrowserGetContentErrorResponse
  | BrowserExtractTextSuccessResponse | BrowserExtractTextErrorResponse
  | BrowserClickSuccessResponse | BrowserClickErrorResponse
  | BrowserTypeSuccessResponse | BrowserTypeErrorResponse
  | BrowserScrollSuccessResponse | BrowserScrollErrorResponse;

/**
 * Browser operation parameters
 */
export interface BrowserGoToPageParams {
  /** URL to navigate to */
  url: string;
  /** Wait for page load */
  waitForLoad?: boolean;
  /** Navigation timeout */
  timeout?: number;
}

export interface BrowserScreenshotParams {
  /** Take full page screenshot */
  fullPage?: boolean;
  /** Image quality (0-100) */
  quality?: number;
  /** Image format */
  format?: 'png' | 'jpeg';
}

export interface BrowserElementSelectorParams {
  /** CSS selector */
  selector: string;
  /** Wait for element */
  waitFor?: boolean;
  /** Timeout for waiting */
  timeout?: number;
}

export interface BrowserTypeParams extends BrowserElementSelectorParams {
  /** Text to type */
  text: string;
  /** Clear field before typing */
  clear?: boolean;
}

export interface BrowserScrollParams {
  /** Horizontal scroll position */
  x?: number;
  /** Vertical scroll position */
  y?: number;
  /** Scroll behavior */
  behavior?: 'auto' | 'smooth';
}

// ================================
// Terminal API Types
// ================================

/**
 * Terminal command execution result
 */
export interface TerminalCommandResult {
  /** Command that was executed */
  command: string;
  /** Exit code */
  exitCode: number;
  /** Standard output */
  stdout?: string;
  /** Standard error */
  stderr?: string;
  /** Execution time in milliseconds */
  executionTime?: number;
  /** Working directory */
  cwd?: string;
}

/**
 * Terminal command output
 */
export interface TerminalCommandOutput {
  /** Output content */
  output: string;
  /** Standard output */
  stdout?: string;
  /** Standard error */
  stderr?: string;
  /** Command being executed */
  command?: string;
  /** Timestamp */
  timestamp?: string;
}

/**
 * Terminal command error
 */
export interface TerminalCommandError {
  /** Error message */
  error: string;
  /** Exit code */
  exitCode?: number;
  /** Standard error */
  stderr?: string;
  /** Command that failed */
  command?: string;
  /** Error type */
  errorType?: 'execution' | 'timeout' | 'permission' | 'not_found';
}

/**
 * Terminal interrupt result
 */
export interface TerminalInterruptResult {
  /** Whether interrupt was successful */
  interrupted: boolean;
  /** Interrupt message */
  message?: string;
  /** Process ID that was interrupted */
  processId?: string;
}

// ================================
// Terminal Response Types
// ================================

/**
 * Base response interface for all Terminal operations
 */
export interface BaseTerminalResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response data - specific to each operation type */
  data?: TerminalCommandResult | TerminalCommandOutput | TerminalCommandError | TerminalInterruptResult | string | number | boolean | Record<string, unknown>;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Terminal command output response types
 */
export interface TerminalCommandOutputSuccessResponse extends BaseTerminalResponse {
  type: 'commandOutput';
  success: true;
  /** Command output data */
  data?: TerminalCommandOutput;
}

export interface TerminalCommandOutputErrorResponse extends BaseTerminalResponse {
  type: 'commandOutput';
  success: false;
  error: string;
}

/**
 * Terminal command error response types
 */
export interface TerminalCommandErrorSuccessResponse extends BaseTerminalResponse {
  type: 'commandError';
  success: true;
  /** Command error data */
  data?: TerminalCommandError;
}

export interface TerminalCommandErrorErrorResponse extends BaseTerminalResponse {
  type: 'commandError';
  success: false;
  error: string;
}

/**
 * Terminal command finish response types
 */
export interface TerminalCommandFinishSuccessResponse extends BaseTerminalResponse {
  type: 'commandFinish';
  success: true;
  /** Command finish data */
  data?: TerminalCommandResult;
}

export interface TerminalCommandFinishErrorResponse extends BaseTerminalResponse {
  type: 'commandFinish';
  success: false;
  error: string;
}

/**
 * Terminal interrupt response types
 */
export interface TerminalInterruptSuccessResponse extends BaseTerminalResponse {
  type: 'terminalInterrupted';
  success: true;
  /** Interrupt result data */
  data?: TerminalInterruptResult;
}

export interface TerminalInterruptErrorResponse extends BaseTerminalResponse {
  type: 'terminalInterrupted';
  success: false;
  error: string;
}

/**
 * Union type for all Terminal responses
 */
export type TerminalResponse = 
  | TerminalCommandOutputSuccessResponse | TerminalCommandOutputErrorResponse
  | TerminalCommandErrorSuccessResponse | TerminalCommandErrorErrorResponse
  | TerminalCommandFinishSuccessResponse | TerminalCommandFinishErrorResponse
  | TerminalInterruptSuccessResponse | TerminalInterruptErrorResponse;

/**
 * Terminal operation parameters
 */
export interface TerminalExecuteParams {
  /** Command to execute */
  command: string;
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to run in background */
  background?: boolean;
  /** Return empty string on success */
  returnEmptyStringOnSuccess?: boolean;
  /** Execute in main process */
  executeInMain?: boolean;
}

// ================================
// Git API Types
// ================================

/**
 * Git file status information
 */
export interface GitFileStatus {
  /** File path */
  path: string;
  /** Index status (staged changes) */
  index: string;
  /** Working directory status (unstaged changes) */
  working_dir: string;
}

/**
 * Git repository status information
 */
export interface GitStatusResult {
  /** Files not added to git */
  not_added: string[];
  /** Files with conflicts */
  conflicted: string[];
  /** Newly created files */
  created: string[];
  /** Deleted files */
  deleted: string[];
  /** Modified files */
  modified: string[];
  /** Renamed files */
  renamed: string[];
  /** Detailed file status information */
  files: GitFileStatus[];
  /** Staged files */
  staged: string[];
  /** Number of commits ahead of remote */
  ahead: number;
  /** Number of commits behind remote */
  behind: number;
  /** Current branch name */
  current: string | null;
  /** Tracking branch name */
  tracking: string | null;
  /** Whether in detached HEAD state */
  detached: boolean;
}

/**
 * Git commit information
 */
export interface GitCommitSummary {
  /** Commit hash */
  hash: string;
  /** Commit date */
  date: string;
  /** Commit message */
  message: string;
  /** Git references (branches, tags) */
  refs: string;
  /** Full commit body */
  body: string;
  /** Author name */
  author_name: string;
  /** Author email */
  author_email: string;
}

/**
 * Git diff file information
 */
export interface GitDiffFile {
  /** File path */
  file: string;
  /** Number of changes */
  changes: number;
  /** Number of insertions */
  insertions: number;
  /** Number of deletions */
  deletions: number;
  /** Whether file is binary */
  binary: boolean;
}

/**
 * Git diff result information
 */
export interface GitDiffResult {
  /** Files with changes */
  files: GitDiffFile[];
  /** Total insertions */
  insertions: number;
  /** Total deletions */
  deletions: number;
  /** Total changed files */
  changed: number;
}

/**
 * Git pull result information
 */
export interface GitPullResult {
  /** Number of files updated */
  files: number;
  /** Number of insertions */
  insertions: number;
  /** Number of deletions */
  deletions: number;
  /** Summary message */
  summary: string;
  /** Remote branch information */
  remote?: {
    name: string;
    url: string;
  };
}

/**
 * Git push result information
 */
export interface GitPushResult {
  /** Number of commits pushed */
  commits: number;
  /** Summary message */
  summary: string;
  /** Remote branch information */
  remote?: {
    name: string;
    url: string;
  };
}

/**
 * Git commit result information
 */
export interface GitCommitResult {
  /** Commit hash */
  hash: string;
  /** Commit message */
  message: string;
  /** Number of files committed */
  files: number;
  /** Number of insertions */
  insertions: number;
  /** Number of deletions */
  deletions: number;
  /** Author information */
  author: {
    name: string;
    email: string;
  };
}

/**
 * Git branch information
 */
export interface GitBranchInfo {
  /** Branch name */
  name: string;
  /** Whether this is the current branch */
  current: boolean;
  /** Commit hash at branch tip */
  commit: string;
  /** Last commit message */
  message: string;
  /** Whether branch is remote */
  remote: boolean;
}

/**
 * Git checkout result information
 */
export interface GitCheckoutResult {
  /** Branch or commit checked out */
  target: string;
  /** Previous branch or commit */
  previous?: string;
  /** Whether checkout was successful */
  success: boolean;
  /** Additional information */
  message?: string;
}

/**
 * Git add result information
 */
export interface GitAddResult {
  /** Number of files added */
  files: number;
  /** List of added files */
  added: string[];
  /** Summary message */
  summary: string;
}

/**
 * Git init result information
 */
export interface GitInitResult {
  /** Repository path */
  path: string;
  /** Whether repository was created */
  created: boolean;
  /** Initial branch name */
  branch: string;
  /** Summary message */
  message: string;
}

// ================================
// Git Response Types
// ================================

/**
 * Base response interface for all Git operations
 */
export interface BaseGitResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response data - specific to each operation type */
  data?: GitInitResult | GitPullResult | GitPushResult | GitStatusResult | GitAddResult | GitCommitResult | GitCheckoutResult | GitBranchInfo[] | GitCommitSummary[] | GitDiffResult | string | number | boolean | Record<string, unknown>;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Git init response types
 */
export interface GitInitSuccessResponse extends BaseGitResponse {
  type: 'gitInitResponse';
  success: true;
  /** Git init result data */
  data?: GitInitResult;
}

export interface GitInitErrorResponse extends BaseGitResponse {
  type: 'gitInitResponse';
  success: false;
  error: string;
}

/**
 * Git pull response types
 */
export interface GitPullSuccessResponse extends BaseGitResponse {
  type: 'PullResponse';
  success: true;
  /** Git pull result data */
  data?: GitPullResult;
}

export interface GitPullErrorResponse extends BaseGitResponse {
  type: 'PullResponse';
  success: false;
  error: string;
}

/**
 * Git push response types
 */
export interface GitPushSuccessResponse extends BaseGitResponse {
  type: 'PushResponse';
  success: true;
  /** Git push result data */
  data?: GitPushResult;
}

export interface GitPushErrorResponse extends BaseGitResponse {
  type: 'PushResponse';
  success: false;
  error: string;
}

/**
 * Git status response types
 */
export interface GitStatusSuccessResponse extends BaseGitResponse {
  type: 'gitStatusResponse';
  success: true;
  /** Git status result data */
  data?: GitStatusResult;
}

export interface GitStatusErrorResponse extends BaseGitResponse {
  type: 'gitStatusResponse';
  success: false;
  error: string;
}

/**
 * Git add response types
 */
export interface GitAddSuccessResponse extends BaseGitResponse {
  type: 'AddResponse';
  success: true;
  /** Git add result data */
  data?: GitAddResult;
}

export interface GitAddErrorResponse extends BaseGitResponse {
  type: 'AddResponse';
  success: false;
  error: string;
}

/**
 * Git commit response types
 */
export interface GitCommitSuccessResponse extends BaseGitResponse {
  type: 'gitCommitResponse';
  success: true;
  /** Git commit result data */
  data?: GitCommitResult;
}

export interface GitCommitErrorResponse extends BaseGitResponse {
  type: 'gitCommitResponse';
  success: false;
  error: string;
}

/**
 * Git checkout response types
 */
export interface GitCheckoutSuccessResponse extends BaseGitResponse {
  type: 'gitCheckoutResponse';
  success: true;
  /** Git checkout result data */
  data?: GitCheckoutResult;
}

export interface GitCheckoutErrorResponse extends BaseGitResponse {
  type: 'gitCheckoutResponse';
  success: false;
  error: string;
}

/**
 * Git branch response types
 */
export interface GitBranchSuccessResponse extends BaseGitResponse {
  type: 'gitBranchResponse';
  success: true;
  /** Array of branch names */
  branches?: string[];
  /** Detailed branch information */
  data?: GitBranchInfo[];
}

export interface GitBranchErrorResponse extends BaseGitResponse {
  type: 'gitBranchResponse';
  success: false;
  error: string;
}

/**
 * Git logs response types
 */
export interface GitLogsSuccessResponse extends BaseGitResponse {
  type: 'gitLogsResponse';
  success: true;
  /** Array of commit summaries */
  logs?: GitCommitSummary[];
  /** Detailed commit information */
  data?: GitCommitSummary[];
}

export interface GitLogsErrorResponse extends BaseGitResponse {
  type: 'gitLogsResponse';
  success: false;
  error: string;
}

/**
 * Git diff response types
 */
export interface GitDiffSuccessResponse extends BaseGitResponse {
  type: 'gitDiffResponse';
  success: true;
  /** Diff content as string */
  diff?: string;
  /** Structured diff result */
  data?: GitDiffResult;
}

export interface GitDiffErrorResponse extends BaseGitResponse {
  type: 'gitDiffResponse';
  success: false;
  error: string;
}

/**
 * Union type for all Git responses
 */
export type GitResponse = 
  | GitInitSuccessResponse | GitInitErrorResponse
  | GitPullSuccessResponse | GitPullErrorResponse
  | GitPushSuccessResponse | GitPushErrorResponse
  | GitStatusSuccessResponse | GitStatusErrorResponse
  | GitAddSuccessResponse | GitAddErrorResponse
  | GitCommitSuccessResponse | GitCommitErrorResponse
  | GitCheckoutSuccessResponse | GitCheckoutErrorResponse
  | GitBranchSuccessResponse | GitBranchErrorResponse
  | GitLogsSuccessResponse | GitLogsErrorResponse
  | GitDiffSuccessResponse | GitDiffErrorResponse;

/**
 * Git operation parameters
 */
export interface GitInitParams {
  /** Path where to initialize the repository */
  path: string;
}

export interface GitPullParams {
  /** Remote name (optional) */
  remote?: string;
  /** Branch name (optional) */
  branch?: string;
}

export interface GitPushParams {
  /** Remote name (optional) */
  remote?: string;
  /** Branch name (optional) */
  branch?: string;
}

export interface GitCommitParams {
  /** Commit message */
  message: string;
  /** Author name (optional) */
  author?: string;
  /** Author email (optional) */
  email?: string;
  /** Whether to add all files before commit */
  addAll?: boolean;
}

export interface GitCheckoutParams {
  /** Branch or commit to checkout */
  branch: string;
  /** Whether to create new branch */
  create?: boolean;
}

export interface GitBranchParams {
  /** Branch name */
  branch: string;
  /** Whether to delete the branch */
  delete?: boolean;
  /** Whether to force the operation */
  force?: boolean;
}

export interface GitLogsParams {
  /** Number of commits to retrieve */
  maxCount?: number;
  /** Starting from commit hash */
  from?: string;
  /** Until commit hash */
  to?: string;
  /** File path to filter logs */
  path?: string;
}

export interface GitDiffParams {
  /** Commit hash to diff against */
  commitHash?: string;
  /** File path to diff */
  file?: string;
  /** Whether to show staged changes */
  staged?: boolean;
}

// ================================
// LLM API Types
// ================================

export interface LLMChatOptions {
  /** Messages in the conversation */
  messages: Message[];
  /** Model to use */
  model?: string;
  /** Temperature (0-1) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Whether to stream response */
  stream?: boolean;
  /** Available tools */
  tools?: Tool[];
  /** Tool choice strategy */
  toolChoice?: 'auto' | 'none' | 'required';
}

// ================================
// Vector Database API Types
// ================================

export interface VectorAddOptions {
  /** Unique identifier */
  id: string;
  /** Vector data */
  vector: number[];
  /** Associated metadata */
  metadata?: Record<string, any>;
  /** Text content */
  content?: string;
}

export interface VectorQueryOptions {
  /** Query vector */
  vector: number[];
  /** Number of results to return */
  topK?: number;
  /** Metadata filters */
  filter?: Record<string, any>;
  /** Minimum similarity score */
  minScore?: number;
}

// ================================
// Agent API Types
// ================================

/**
 * Agent function definition
 */
export interface AgentFunction {
  /** Function type */
  type: 'function';
  /** Function details */
  function: {
    /** Function name */
    name: string;
    /** Function description */
    description: string;
    /** Function parameters */
    parameters: {
      /** Parameter type */
      type: 'object';
      /** Parameter properties */
      properties: Record<string, {
        /** Property type */
        type: string;
        /** Property description */
        description: string;
      }>;
      /** Required properties */
      required?: string[];
      /** Additional properties allowed */
      additionalProperties?: boolean;
    };
    /** Strict mode */
    strict?: boolean;
  };
}

/**
 * Agent detail information
 */
export interface AgentDetail {
  /** Agent ID */
  id: string;
  /** Agent name */
  name: string;
  /** Agent description */
  description?: string;
  /** Agent type */
  type?: string;
  /** Agent location */
  location?: string;
  /** Agent functions */
  functions?: AgentFunction[];
  /** Agent metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agent search result
 */
export interface AgentSearchResult {
  /** Agent details */
  agent: AgentDetail;
  /** Search relevance score */
  score: number;
  /** Search match details */
  matchDetails?: {
    /** Matched task */
    task: string;
    /** Match confidence */
    confidence: number;
  };
}

/**
 * Agent task completion result
 */
export interface AgentTaskCompletionResult {
  /** Agent ID */
  agentId: string;
  /** Task that was completed */
  task: string;
  /** Completion result */
  result: string;
  /** Completion status */
  status: 'completed' | 'failed' | 'in_progress';
  /** Completion timestamp */
  timestamp: string;
  /** Completion metadata */
  metadata?: Record<string, unknown>;
}

// ================================
// Agent Response Types
// ================================

/**
 * Base response interface for all Agent operations
 */
export interface BaseAgentResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response data - specific to each operation type */
  data?: AgentSearchResult[] | AgentDetail[] | AgentFunction[] | AgentTaskCompletionResult | string | number | boolean | Record<string, unknown>;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Agent find response types
 */
export interface AgentFindSuccessResponse extends BaseAgentResponse {
  type: 'findAgentByTaskResponse';
  success: true;
  /** Agent search results */
  agents?: AgentSearchResult[];
  /** Search result data */
  data?: AgentSearchResult[];
}

export interface AgentFindErrorResponse extends BaseAgentResponse {
  type: 'findAgentByTaskResponse';
  success: false;
  error: string;
}

/**
 * Agent list response types
 */
export interface AgentListSuccessResponse extends BaseAgentResponse {
  type: 'listAgentsResponse';
  success: true;
  /** List of agents */
  agents?: AgentFunction[];
  /** Agent list data */
  data?: AgentFunction[];
}

export interface AgentListErrorResponse extends BaseAgentResponse {
  type: 'listAgentsResponse';
  success: false;
  error: string;
}

/**
 * Agent detail response types
 */
export interface AgentDetailSuccessResponse extends BaseAgentResponse {
  type: 'agentsDetailResponse';
  success: true;
  /** Agent details payload */
  payload?: {
    agents: AgentDetail[];
  };
  /** Agent details data */
  data?: AgentDetail[];
}

export interface AgentDetailErrorResponse extends BaseAgentResponse {
  type: 'agentsDetailResponse';
  success: false;
  error: string;
}

/**
 * Agent task completion response types
 */
export interface AgentTaskCompletionSuccessResponse extends BaseAgentResponse {
  type: 'taskCompletionResponse';
  success: true;
  /** Task completion result */
  from?: string;
  /** Agent ID */
  agentId?: string;
  /** Task */
  task?: string;
  /** Completion result */
  result?: string;
  /** Task completion data */
  data?: AgentTaskCompletionResult;
}

export interface AgentTaskCompletionErrorResponse extends BaseAgentResponse {
  type: 'taskCompletionResponse';
  success: false;
  error: string;
}

/**
 * Union type for all Agent responses
 */
export type AgentResponse = 
  | AgentFindSuccessResponse | AgentFindErrorResponse
  | AgentListSuccessResponse | AgentListErrorResponse
  | AgentDetailSuccessResponse | AgentDetailErrorResponse
  | AgentTaskCompletionSuccessResponse | AgentTaskCompletionErrorResponse;

/**
 * Agent operation parameters
 */
export interface AgentFindParams {
  /** Task to find agent for */
  task: string;
  /** Maximum results to return */
  maxResult?: number;
  /** Agent filter list */
  agents?: string[];
  /** Agent location filter */
  agentLocation?: string;
  /** Filter using method */
  getFrom?: string;
}

export interface AgentStartParams {
  /** Agent ID to start */
  agentId: string;
  /** Task for the agent */
  task: string;
}

export interface AgentListParams {
  /** Agent type filter */
  type?: string;
}

export interface AgentDetailParams {
  /** List of agent IDs to get details for */
  agentList?: string[];
}

// ================================
// Memory API Types
// ================================

/**
 * Memory entry information
 */
export interface MemoryEntry {
  /** Memory key */
  key: string;
  /** Memory value */
  value: string | number | boolean | Record<string, unknown> | unknown[];
  /** Memory expiration time */
  expiresAt?: string;
  /** Memory creation timestamp */
  createdAt: string;
  /** Memory update timestamp */
  updatedAt: string;
}

/**
 * Memory operation result
 */
export interface MemoryOperationResult {
  /** Operation key */
  key: string;
  /** Operation success */
  success: boolean;
  /** Operation message */
  message?: string;
  /** Operation timestamp */
  timestamp: string;
}

/**
 * Memory list result
 */
export interface MemoryListResult {
  /** Memory entries */
  entries: Record<string, MemoryEntry>;
  /** Memory keys */
  keys: string[];
  /** Total count */
  totalCount: number;
}

// ================================
// Memory Response Types
// ================================

/**
 * Base response interface for all Memory operations
 */
export interface BaseMemoryResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response data - specific to each operation type */
  data?: MemoryOperationResult | MemoryListResult | MemoryEntry | string | number | boolean | Record<string, unknown>;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Memory set response types
 */
export interface MemorySetSuccessResponse extends BaseMemoryResponse {
  type: 'memorySetResponse';
  success: true;
  /** Memory key */
  key?: string;
  /** Memory value */
  value?: string | number | boolean | Record<string, unknown> | unknown[];
  /** Memory operation data */
  data?: MemoryOperationResult;
}

export interface MemorySetErrorResponse extends BaseMemoryResponse {
  type: 'memorySetResponse';
  success: false;
  error: string;
}

/**
 * Memory get response types
 */
export interface MemoryGetSuccessResponse extends BaseMemoryResponse {
  type: 'memoryGetResponse';
  success: true;
  /** Memory key */
  key?: string;
  /** Memory value */
  value?: string | number | boolean | Record<string, unknown> | unknown[];
  /** Memory entry data */
  data?: MemoryEntry;
}

export interface MemoryGetErrorResponse extends BaseMemoryResponse {
  type: 'memoryGetResponse';
  success: false;
  error: string;
}

/**
 * Memory delete response types
 */
export interface MemoryDeleteSuccessResponse extends BaseMemoryResponse {
  type: 'memoryDeleteResponse';
  success: true;
  /** Memory key */
  key?: string;
  /** Memory operation data */
  data?: MemoryOperationResult;
}

export interface MemoryDeleteErrorResponse extends BaseMemoryResponse {
  type: 'memoryDeleteResponse';
  success: false;
  error: string;
}

/**
 * Memory list response types
 */
export interface MemoryListSuccessResponse extends BaseMemoryResponse {
  type: 'memoryListResponse';
  success: true;
  /** Memory keys */
  keys?: string[];
  /** Memory entries */
  entries?: Record<string, MemoryEntry>;
  /** Memory list data */
  data?: MemoryListResult;
}

export interface MemoryListErrorResponse extends BaseMemoryResponse {
  type: 'memoryListResponse';
  success: false;
  error: string;
}

/**
 * Memory clear response types
 */
export interface MemoryClearSuccessResponse extends BaseMemoryResponse {
  type: 'memoryClearResponse';
  success: true;
  /** Memory operation data */
  data?: MemoryOperationResult;
}

export interface MemoryClearErrorResponse extends BaseMemoryResponse {
  type: 'memoryClearResponse';
  success: false;
  error: string;
}

/**
 * Union type for all Memory responses
 */
export type MemoryResponse = 
  | MemorySetSuccessResponse | MemorySetErrorResponse
  | MemoryGetSuccessResponse | MemoryGetErrorResponse
  | MemoryDeleteSuccessResponse | MemoryDeleteErrorResponse
  | MemoryListSuccessResponse | MemoryListErrorResponse
  | MemoryClearSuccessResponse | MemoryClearErrorResponse;

// ================================
// State Management API Types
// ================================

/**
 * State entry information
 */
export interface StateEntry {
  /** State key */
  key: string;
  /** State value */
  value: string | number | boolean | Record<string, unknown> | unknown[];
  /** State update timestamp */
  updatedAt: string;
  /** State metadata */
  metadata?: Record<string, unknown>;
}

/**
 * State operation result
 */
export interface StateOperationResult {
  /** Operation key */
  key: string;
  /** Operation success */
  success: boolean;
  /** Operation message */
  message?: string;
  /** Operation timestamp */
  timestamp: string;
}

/**
 * State list result
 */
export interface StateListResult {
  /** State entries */
  entries: Record<string, StateEntry>;
  /** State keys */
  keys: string[];
  /** Total count */
  totalCount: number;
}

// ================================
// State Response Types
// ================================

/**
 * Base response interface for all State operations
 */
export interface BaseStateResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response data - specific to each operation type */
  data?: StateOperationResult | StateListResult | StateEntry | Record<string, unknown> | string | number | boolean;
  /** Error message if operation failed */
  error?: string;
}

/**
 * State get response types
 */
export interface StateGetSuccessResponse extends BaseStateResponse {
  type: 'getAppStateResponse' | 'getAgentStateResponse';
  success: true;
  /** State data */
  state?: Record<string, unknown>;
  /** State payload */
  payload?: Record<string, unknown>;
  /** State data */
  data?: Record<string, unknown>;
}

export interface StateGetErrorResponse extends BaseStateResponse {
  type: 'getAppStateResponse' | 'getAgentStateResponse';
  success: false;
  error: string;
}

/**
 * State update response types
 */
export interface StateUpdateSuccessResponse extends BaseStateResponse {
  type: 'updateProjectStateResponse' | 'addToAgentStateResponse';
  success: true;
  /** State data */
  state?: Record<string, unknown>;
  /** State payload */
  payload?: { success: boolean };
  /** State operation data */
  data?: StateOperationResult;
}

export interface StateUpdateErrorResponse extends BaseStateResponse {
  type: 'updateProjectStateResponse' | 'addToAgentStateResponse';
  success: false;
  error: string;
}

/**
 * Union type for all State responses
 */
export type StateResponse = 
  | StateGetSuccessResponse | StateGetErrorResponse
  | StateUpdateSuccessResponse | StateUpdateErrorResponse;

// ================================
// Project API Types
// ================================

/**
 * Project information
 */
export interface ProjectInfo {
  /** Project name */
  name: string;
  /** Project path */
  path: string;
  /** Project type */
  type?: string;
  /** Project configuration */
  config?: Record<string, unknown>;
  /** Project metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Project settings
 */
export interface ProjectSettings {
  /** Settings data */
  settings: Record<string, unknown>;
  /** Project path */
  projectPath?: string;
  /** Project name */
  projectName?: string;
}

/**
 * Project state
 */
export interface ProjectState {
  /** State data */
  state: Record<string, unknown>;
  /** Project path */
  projectPath?: string;
  /** Project name */
  projectName?: string;
}

/**
 * Repository map
 */
export interface RepositoryMap {
  /** Repository structure */
  structure: Record<string, unknown>;
  /** Repository metadata */
  metadata?: Record<string, unknown>;
}

// ================================
// Project Response Types
// ================================

/**
 * Base response interface for all Project operations
 */
export interface BaseProjectResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response data - specific to each operation type */
  data?: ProjectInfo | ProjectSettings | ProjectState | RepositoryMap | string | number | boolean | Record<string, unknown>;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Project path response types
 */
export interface ProjectPathSuccessResponse extends BaseProjectResponse {
  type: 'getProjectPathResponse';
  success: true;
  /** Project path */
  projectPath?: string;
  /** Project name */
  projectName?: string;
  /** Project info data */
  data?: ProjectInfo;
}

export interface ProjectPathErrorResponse extends BaseProjectResponse {
  type: 'getProjectPathResponse';
  success: false;
  error: string;
}

/**
 * Project settings response types
 */
export interface ProjectSettingsSuccessResponse extends BaseProjectResponse {
  type: 'getProjectSettingsResponse';
  success: true;
  /** Project settings */
  projectSettings?: Record<string, unknown>;
  /** Project settings data */
  data?: ProjectSettings;
}

export interface ProjectSettingsErrorResponse extends BaseProjectResponse {
  type: 'getProjectSettingsResponse';
  success: false;
  error: string;
}

/**
 * Project state response types
 */
export interface ProjectStateSuccessResponse extends BaseProjectResponse {
  type: 'getProjectStateResponse';
  success: true;
  /** Project state */
  projectState?: Record<string, unknown>;
  /** Project state data */
  data?: ProjectState;
}

export interface ProjectStateErrorResponse extends BaseProjectResponse {
  type: 'getProjectStateResponse';
  success: false;
  error: string;
}

/**
 * Repository map response types
 */
export interface RepositoryMapSuccessResponse extends BaseProjectResponse {
  type: 'getRepoMapResponse';
  success: true;
  /** Repository map */
  repoMap?: RepositoryMap;
  /** Repository map data */
  data?: RepositoryMap;
}

export interface RepositoryMapErrorResponse extends BaseProjectResponse {
  type: 'getRepoMapResponse';
  success: false;
  error: string;
}

/**
 * Union type for all Project responses
 */
export type ProjectResponse = 
  | ProjectPathSuccessResponse | ProjectPathErrorResponse
  | ProjectSettingsSuccessResponse | ProjectSettingsErrorResponse
  | ProjectStateSuccessResponse | ProjectStateErrorResponse
  | RepositoryMapSuccessResponse | RepositoryMapErrorResponse;

// ================================
// Chat API Types
// ================================

/**
 * Chat message information
 */
export interface ChatMessageInfo {
  /** Message ID */
  id: string;
  /** Message content */
  content: string;
  /** Message sender */
  sender: string;
  /** Message timestamp */
  timestamp: string;
  /** Message type */
  type: string;
  /** Message role */
  role?: 'user' | 'assistant' | 'system';
  /** Message metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Chat history result
 */
export interface ChatHistoryResult {
  /** Array of chat messages */
  messages: ChatMessageInfo[];
  /** Total message count */
  totalCount: number;
  /** Conversation ID */
  conversationId?: string;
  /** Agent ID */
  agentId?: string;
}

/**
 * Chat reply result
 */
export interface ChatReplyResult {
  /** Reply message */
  message: string;
  /** Reply ID */
  messageId: string;
  /** Thread ID */
  threadId: string;
  /** Reply timestamp */
  timestamp: string;
  /** Reply metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Chat process control result
 */
export interface ChatProcessControlResult {
  /** Process ID */
  processId: string;
  /** Process status */
  status: 'started' | 'stopped' | 'running';
  /** Process message */
  message?: string;
  /** Process metadata */
  metadata?: Record<string, unknown>;
}

// ================================
// Chat Response Types
// ================================

/**
 * Base response interface for all Chat operations
 */
export interface BaseChatResponse {
  /** Response type identifier */
  type: string;
  /** Unique request identifier */
  requestId: string;
  /** Whether the operation was successful */
  success?: boolean;
  /** Response message */
  message?: string;
  /** Response data - specific to each operation type */
  data?: ChatHistoryResult | ChatReplyResult | ChatProcessControlResult | ChatMessageInfo[] | string | number | boolean | Record<string, unknown>;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Chat history response types
 */
export interface ChatGetHistorySuccessResponse extends BaseChatResponse {
  type: 'getChatHistoryResponse';
  success: true;
  /** Chat history result data */
  data?: ChatHistoryResult;
}

export interface ChatGetHistoryErrorResponse extends BaseChatResponse {
  type: 'getChatHistoryResponse';
  success: false;
  error: string;
}

/**
 * Chat reply response types
 */
export interface ChatWaitForReplySuccessResponse extends BaseChatResponse {
  type: 'waitForReplyResponse';
  success: true;
  /** Chat reply result data */
  data?: ChatReplyResult;
}

export interface ChatWaitForReplyErrorResponse extends BaseChatResponse {
  type: 'waitForReplyResponse';
  success: false;
  error: string;
}

/**
 * Chat process control response types
 */
export interface ChatProcessStartedSuccessResponse extends BaseChatResponse {
  type: 'processStartedResponse';
  success: true;
  /** Process control result data */
  data?: ChatProcessControlResult;
}

export interface ChatProcessStartedErrorResponse extends BaseChatResponse {
  type: 'processStartedResponse';
  success: false;
  error: string;
}

export interface ChatProcessStoppedSuccessResponse extends BaseChatResponse {
  type: 'processStoppedResponse';
  success: true;
  /** Process control result data */
  data?: ChatProcessControlResult;
}

export interface ChatProcessStoppedErrorResponse extends BaseChatResponse {
  type: 'processStoppedResponse';
  success: false;
  error: string;
}

/**
 * Union type for all Chat responses
 */
export type ChatResponse = 
  | ChatGetHistorySuccessResponse | ChatGetHistoryErrorResponse
  | ChatWaitForReplySuccessResponse | ChatWaitForReplyErrorResponse
  | ChatProcessStartedSuccessResponse | ChatProcessStartedErrorResponse
  | ChatProcessStoppedSuccessResponse | ChatProcessStoppedErrorResponse;

/**
 * Chat operation parameters
 */
export interface ChatSendMessageParams {
  /** Message content */
  message: string;
  /** Conversation ID */
  conversationId?: string;
  /** Message metadata */
  metadata?: Record<string, unknown>;
  /** Mentioned files */
  mentionedFiles?: string[];
  /** Mentioned agents */
  mentionedAgents?: string[];
}

export interface ChatWaitForReplyParams {
  /** Message to wait for reply to */
  message: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Conversation ID */
  conversationId?: string;
}

export interface ChatProcessControlParams {
  /** Process ID */
  processId?: string;
  /** Process message */
  message?: string;
  /** Process metadata */
  metadata?: Record<string, unknown>;
}

/**
 * This file contains comprehensive TypeScript types for the codeboltjs library API.
 * 
 * Key sections include:
 * - Message Types for Library API
 * - File System API Types and Response Types
 * - Browser API Types
 * - Terminal API Types
 * - Git API Types
 * - LLM API Types
 * - Vector Database API Types
 * - Agent API Types
 * - Memory API Types
 * - Task API Types
 * - Code Utils API Types
 * - Debug API Types
 * - Project API Types
 * - Crawler API Types
 * - MCP Tools API Types
 * - State Management API Types
 * - Chat API Types
 * - Notification API Types
 * - Utility Types for API
 * - Event Types for API
 * - Configuration Types for Library
 * - Callback Types
 * 
 * All types are designed to be user-friendly and provide comprehensive
 * type safety for the codeboltjs library functions.
 */
