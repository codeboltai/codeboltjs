// --- Enums and Constants ---

/** Task status */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'failed';

/** Task priority */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// --- Core Entities ---

/** Subtask */
export interface SubTask {
  id?: string;
  title: string;
  description?: string;
  completed?: boolean;
}

/** Task */
export interface Task {
  id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  completed?: boolean;
  subtasks?: SubTask[];
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  projectPath?: string;
  parentTaskId?: string;
  childTaskIds?: string[];
  threadId?: string;
  metadata?: Record<string, unknown>;
}

/** Task statistics */
export interface TaskStatistics {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

/** Task hierarchy */
export interface TaskHierarchy {
  task: Task;
  children: TaskHierarchy[];
}

/** Task message */
export interface TaskMessage {
  id?: string;
  taskId: string;
  content: string;
  sender?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

// --- Request Types ---

/** Create task request */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string;
  subtasks?: SubTask[];
  tags?: string[];
  projectPath?: string;
  threadId?: string;
  metadata?: Record<string, unknown>;
}

/** Update task request */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  completed?: boolean;
  assignee?: string;
  dueDate?: string;
  subtasks?: SubTask[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/** Task search params */
export interface TaskSearchParams {
  query?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  projectPath?: string;
  limit?: number;
  offset?: number;
}

/** Add task message request */
export interface AddTaskMessageRequest {
  content: string;
  sender?: string;
  metadata?: Record<string, unknown>;
}
