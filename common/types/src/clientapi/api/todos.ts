// --- Enums and Constants ---

/** Todo status */
export type TodoStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

/** Todo priority */
export type TodoPriority = 'low' | 'medium' | 'high';

// --- Core Entities ---

/** Todo item */
export interface TodoItem {
  id: string;
  title: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt?: string;
  priority?: TodoPriority;
  tags?: string[];
}

/** Todo list / thread */
export interface TodoList {
  id: string;
  title?: string;
  toDos: TodoItem[];
  archived?: boolean;
  type?: 'todo';
}

/** Todo statistics */
export interface TodoStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

// --- Request Types ---

/** Create todo request */
export interface CreateTodoRequest {
  title: string;
  threadId?: string;
  priority?: TodoPriority;
  tags?: string[];
}

/** Update todo request */
export interface UpdateTodoRequest {
  title?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
}

/** Bulk create todos request */
export interface BulkCreateTodosRequest {
  threadId?: string;
  todos: CreateTodoRequest[];
}

/** Import todos request */
export interface ImportTodosRequest {
  threadId?: string;
  source: string;
  data: unknown;
}

/** Create todo thread request */
export interface CreateTodoThreadRequest {
  title?: string;
  metadata?: Record<string, unknown>;
}

/** Todo list params */
export interface TodoListParams {
  threadId?: string;
}

/** Todo export params */
export interface TodoExportParams {
  threadId?: string;
}
