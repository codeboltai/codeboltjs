/**
 * Task Planer SDK Function Types
 * Types for the taskplaner module functions
 */

// Base response interface for task planer operations
export interface BaseTaskPlanerSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * Task item structure
 */
export interface TaskItem {
  id?: string;
  title?: string;
  description?: string;
  completed?: boolean;
  status?: string;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response for adding a task
 */
export interface AddTaskResponse extends BaseTaskPlanerSDKResponse {
  task?: TaskItem;
  taskId?: string;
}

/**
 * Response for getting tasks
 */
export interface GetTasksResponse extends BaseTaskPlanerSDKResponse {
  tasks?: TaskItem[];
  total?: number;
}

/**
 * Response for updating tasks
 */
export interface UpdateTasksResponse extends BaseTaskPlanerSDKResponse {
  task?: TaskItem;
  updated?: boolean;
}
