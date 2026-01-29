/**
 * Action Plan SDK Function Types
 * Types for the codeboltActionPlan module functions
 */

// Base response interface for action plan operations
export interface BaseActionPlanSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Task status values
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

/**
 * Group types for action plans
 */
export type ActionPlanGroupType = 'parallelGroup' | 'loopGroup' | 'ifGroup' | 'waitUntilGroup';

/**
 * Action plan task structure
 */
export interface ActionPlanTask {
  id?: string;
  name: string;
  description?: string;
  priority?: TaskPriority;
  taskType?: string;
  status?: TaskStatus;
  order?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Action plan group structure
 */
export interface ActionPlanGroup {
  type: ActionPlanGroupType;
  name?: string;
  groupItems?: Record<string, ActionPlanTask[]>;
  loopTasks?: ActionPlanTask[];
  ifTasks?: ActionPlanTask[];
  waitTasks?: ActionPlanTask[];
  condition?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Action plan summary
 */
export interface ActionPlan {
  planId: string;
  name: string;
  description?: string;
  agentId?: string;
  agentName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Action plan detail with tasks
 */
export interface ActionPlanDetail extends ActionPlan {
  tasks?: ActionPlanTask[];
  groups?: ActionPlanGroup[];
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating an action plan
 */
export interface ActionPlanUpdateData {
  name?: string;
  description?: string;
  status?: string;
  agentId?: string;
  agentName?: string;
  metadata?: Record<string, unknown>;
}

// Action plan responses
export interface GetAllPlansResponse extends BaseActionPlanSDKResponse {
  plans?: ActionPlan[];
}

export interface GetPlanDetailResponse extends BaseActionPlanSDKResponse {
  plan?: ActionPlanDetail;
}

export interface CreateActionPlanResponse extends BaseActionPlanSDKResponse {
  plan?: ActionPlan;
  planId?: string;
}

export interface UpdateActionPlanResponse extends BaseActionPlanSDKResponse {
  plan?: ActionPlan;
}

export interface AddTaskToActionPlanResponse extends BaseActionPlanSDKResponse {
  task?: ActionPlanTask;
  plan?: ActionPlanDetail;
}

export interface StartTaskStepResponse extends BaseActionPlanSDKResponse {
  taskId?: string;
  status?: TaskStatus;
  result?: unknown;
}

/**
 * Task step response structure for listener callbacks
 */
export interface TaskStepResponse {
  type: string;
  taskId?: string;
  planId?: string;
  status?: string;
  result?: unknown;
  error?: string;
  success?: boolean;
}
