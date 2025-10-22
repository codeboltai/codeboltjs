/**
 * Service types and interfaces
 */

/**
 * File filtering options
 */
export interface FileFilteringOptions {
  respectGitIgnore?: boolean;
  respectGeminiIgnore?: boolean;
}

/**
 * Workspace context interface
 */
export interface WorkspaceContext {
  getDirectories(): readonly string[];
  isPathWithinWorkspace(path: string): boolean;
}

/**
 * File system service interface
 */
export interface FileSystemService {
  readTextFile(path: string): Promise<string>;
  writeTextFile(path: string, content: string): Promise<void>;
}

/**
 * Error types for tool operations
 */
export enum ToolErrorType {
  // General Errors
  INVALID_TOOL_PARAMS = 'invalid_tool_params',
  UNKNOWN = 'unknown',
  UNHANDLED_EXCEPTION = 'unhandled_exception',
  TOOL_NOT_REGISTERED = 'tool_not_registered',
  EXECUTION_FAILED = 'execution_failed',

  // File System Errors
  FILE_NOT_FOUND = 'file_not_found',
  FILE_WRITE_FAILURE = 'file_write_failure',
  READ_CONTENT_FAILURE = 'read_content_failure',
  ATTEMPT_TO_CREATE_EXISTING_FILE = 'attempt_to_create_existing_file',
  FILE_TOO_LARGE = 'file_too_large',
  PERMISSION_DENIED = 'permission_denied',
  NO_SPACE_LEFT = 'no_space_left',
  TARGET_IS_DIRECTORY = 'target_is_directory',
  PATH_NOT_IN_WORKSPACE = 'path_not_in_workspace',
  SEARCH_PATH_NOT_FOUND = 'search_path_not_found',
  SEARCH_PATH_NOT_A_DIRECTORY = 'search_path_not_a_directory',

  // Edit-specific Errors
  EDIT_PREPARATION_FAILURE = 'edit_preparation_failure',
  EDIT_NO_OCCURRENCE_FOUND = 'edit_no_occurrence_found',
  EDIT_EXPECTED_OCCURRENCE_MISMATCH = 'edit_expected_occurrence_mismatch',
  EDIT_NO_CHANGE = 'edit_no_change',

  // Tool-specific Errors
  GLOB_EXECUTION_ERROR = 'glob_execution_error',
  GREP_EXECUTION_ERROR = 'grep_execution_error',
  LS_EXECUTION_ERROR = 'ls_execution_error',
  PATH_IS_NOT_A_DIRECTORY = 'path_is_not_a_directory',
  MCP_TOOL_ERROR = 'mcp_tool_error',
  MEMORY_TOOL_EXECUTION_ERROR = 'memory_tool_execution_error',
  READ_MANY_FILES_SEARCH_ERROR = 'read_many_files_search_error',
  SHELL_EXECUTE_ERROR = 'shell_execute_error',
  DISCOVERED_TOOL_EXECUTION_ERROR = 'discovered_tool_execution_error',
  WEB_FETCH_NO_URL_IN_PROMPT = 'web_fetch_no_url_in_prompt',
  WEB_FETCH_FALLBACK_FAILED = 'web_fetch_fallback_failed',
  WEB_FETCH_PROCESSING_ERROR = 'web_fetch_processing_error',
  WEB_SEARCH_FAILED = 'web_search_failed',
}

/**
 * Statistics about differences between content versions
 */
export interface DiffStat {
  model_added_lines: number;
  model_removed_lines: number;
  model_added_chars: number;
  model_removed_chars: number;
  user_added_lines: number;
  user_removed_lines: number;
  user_added_chars: number;
  user_removed_chars: number;
}