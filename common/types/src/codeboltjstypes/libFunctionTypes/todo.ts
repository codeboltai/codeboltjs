/**
 * Todo SDK Function Types
 * Types for the cbtodo module functions
 */

// Base response interface for todo operations
export interface BaseTodoSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
  /** Request identifier */
  requestId?: string;
  /** Response timestamp */
  timestamp?: string;
}

// Todo item interface
export interface TodoItem {
  /** Todo item ID */
  id: string;
  /** Todo title */
  title: string;
  /** Todo status */
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  /** Todo priority */
  priority?: 'high' | 'medium' | 'low';
  /** Todo tags */
  tags?: string[];
  /** Todo description */
  description?: string;
  /** Due date */
  dueDate?: string;
  /** Creation timestamp */
  createdAt?: string;
  /** Update timestamp */
  updatedAt?: string;
}

// Todo list interface
export interface TodoList {
  /** List ID */
  id: string;
  /** List name */
  name: string;
  /** Todo items in the list */
  todos: TodoItem[];
  /** Archived status */
  archived?: boolean;
  /** Creation timestamp */
  createdAt?: string;
  /** Update timestamp */
  updatedAt?: string;
}

// Todo operation responses
export interface AddTodoResponse extends BaseTodoSDKResponse {
  /** Created todo item */
  todo?: TodoItem;
  /** Todo item ID */
  id?: string;
}

export interface UpdateTodoResponse extends BaseTodoSDKResponse {
  /** Updated todo item */
  todo?: TodoItem;
}

export interface GetTodoListResponse extends BaseTodoSDKResponse {
  /** Todo list data */
  todoList?: TodoList;
  /** Todo lists */
  lists?: TodoList[];
}

export interface GetAllIncompleteTodosResponse extends BaseTodoSDKResponse {
  /** Incomplete todo items */
  todos?: TodoItem[];
}

export interface ChangeTodoItemStatusResponse extends BaseTodoSDKResponse {
  /** Updated todo item */
  todo?: TodoItem;
  /** New status */
  status?: string;
}

export interface GetTodoStatsResponse extends BaseTodoSDKResponse {
  /** Total todos count */
  total?: number;
  /** Completed todos count */
  completed?: number;
  /** Pending todos count */
  pending?: number;
  /** In progress todos count */
  inProgress?: number;
  /** Cancelled todos count */
  cancelled?: number;
  /** Stats by priority */
  byPriority?: {
    high?: number;
    medium?: number;
    low?: number;
  };
}

export interface DeleteTodoItemResponse extends BaseTodoSDKResponse {
  /** Deleted todo item ID */
  id?: string;
  /** Whether the deletion was successful */
  deleted?: boolean;
}

export interface ArchiveTodoListResponse extends BaseTodoSDKResponse {
  /** Archived list ID */
  id?: string;
  /** Archived status */
  archived?: boolean;
}

export interface UnarchiveTodoListResponse extends BaseTodoSDKResponse {
  /** Unarchived list ID */
  id?: string;
  /** Archived status */
  archived?: boolean;
}

export interface DeleteCompletedTodosResponse extends BaseTodoSDKResponse {
  /** Number of todos deleted */
  count?: number;
  /** Deleted todo IDs */
  ids?: string[];
}

export interface ExportTodosResponse extends BaseTodoSDKResponse {
  /** Exported data (JSON or markdown format) */
  data?: string;
  /** Export format used */
  format?: 'json' | 'markdown';
  /** Number of todos exported */
  count?: number;
}

export interface ImportTodosResponse extends BaseTodoSDKResponse {
  /** Number of todos imported */
  count?: number;
  /** Created todo items */
  todos?: TodoItem[];
  /** Import result details */
  result?: {
    added?: number;
    updated?: number;
    skipped?: number;
    errors?: string[];
  };
}

/**
 * Todo operation parameters
 */
export interface AddTodoParams {
  /** Todo title */
  title: string;
  /** Todo priority */
  priority?: 'high' | 'medium' | 'low';
  /** Todo tags */
  tags?: string[];
  /** Todo description */
  description?: string;
  /** Due date */
  dueDate?: string;
}

export interface UpdateTodoParams {
  /** Todo item ID */
  id: string;
  /** New title */
  title?: string;
  /** New status */
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  /** New priority */
  priority?: 'high' | 'medium' | 'low';
  /** New tags */
  tags?: string[];
  /** New description */
  description?: string;
  /** New due date */
  dueDate?: string;
}

export interface ChangeTodoItemStatusParams {
  /** Todo item ID */
  id: string;
  /** New status */
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface ExportTodosParams {
  /** Export format */
  format?: 'json' | 'markdown';
  /** Filter by list ID */
  listId?: string;
  /** Filter by status */
  status?: string[];
}

export interface ImportTodosParams {
  /** Import data (JSON or markdown format) */
  data: string;
  /** Import format */
  format?: 'json' | 'markdown';
  /** Merge strategy: 'replace' replaces all todos, 'merge' combines with existing */
  mergeStrategy?: 'replace' | 'merge';
  /** Target list ID */
  listId?: string;
}
