import { z } from 'zod';

/**
 * Task Service Response Schemas
 * Messages sent from task CLI service back to agents
 * Based on CodeBolt tasksService.cli.ts response types
 */

// Base response schema
const baseResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// Task message schema
const taskMessageSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  stepId: z.string().optional(),
  message: z.string(),
  messageType: z.enum(['info', 'error', 'warning', 'success', 'steering', 'instruction', 'feedback']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  timestamp: z.string(),
  userId: z.string().optional(),
  agentId: z.string().optional(),
});

// Metadata schema
const metadataSchema = z.object({
  mentionedFiles: z.array(z.string()),
  mentionedFullPaths: z.array(z.string()),
  mentionedFolders: z.array(z.string()),
  mentionedMultiFile: z.array(z.string()),
  mentionedMCPs: z.array(z.string()),
  uploadedImages: z.array(z.string()),
  mentionedAgents: z.array(z.string()),
  mentionedDocs: z.array(z.string()),
  links: z.array(z.string()),
  controlFiles: z.array(z.string()),
  isRemoteTask: z.boolean(),
  environment: z.record(z.any()).nullable(),
  llmProvider: z.object({
    providerId: z.string(),
    model: z.string(),
  }).optional(),
});

// Position schema
const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Flow node data schema
const flowNodeDataSchema = z.object({
  value: z.string(),
  userMessage: z.string(),
  metaData: metadataSchema,
  condition: z.string(),
  agentId: z.string(),
  isMainTask: z.boolean(),
});

// Flow node schema
const flowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: positionSchema,
  data: flowNodeDataSchema,
});

// Flow data schema
const flowDataSchema = z.object({
  nodes: z.array(flowNodeSchema),
  edges: z.array(z.any()),
});

// Step schema
const stepSchema = z.object({
  id: z.string(),
  type: z.string(),
  userMessage: z.string(),
  metaData: metadataSchema,
  isMainTask: z.boolean(),
  position: positionSchema,
  condition: z.string(),
  agentId: z.string(),
  FlowData: flowDataSchema.optional(),
  status: z.string(),
});

// Extended step schema
const extendedStepSchema = stepSchema.extend({
  taskId: z.string(),
  taskName: z.string(),
  messages: z.array(taskMessageSchema).optional(),
  isActive: z.boolean().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

// Task schema
const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  dueDate: z.date().nullable(),
  steps: z.array(stepSchema),
  completed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  threadId: z.string(),
  isRemoteTask: z.boolean(),
  environment: z.string().nullable(),
  isKanbanTask: z.boolean(),
  taskType: z.enum(['scheduled', 'interactive']),
  executionType: z.enum(['scheduled', 'immediate', 'manual', 'conditional']),
  environmentType: z.enum(['local', 'remote']),
  groupId: z.string(),
  startOption: z.enum(['immediately', 'manual', 'based_on_group', 'ontaskfinish']),
  dependsOnTaskId: z.string().optional(),
  dependsOnTaskName: z.string().optional(),
});

// Extended task schema
const extendedTaskSchema = taskSchema.extend({
  startedBy: z.string().optional(),
  currentStep: stepSchema.optional(),
  activeSteps: z.array(stepSchema).optional(),
  messages: z.array(taskMessageSchema).optional(),
  progress: z.object({
    totalSteps: z.number(),
    completedSteps: z.number(),
    percentage: z.number(),
  }).optional(),
});

// Task stats schema
const taskStatsSchema = z.object({
  total: z.number(),
  completed: z.number(),
  pending: z.number(),
  processing: z.number(),
  overdue: z.number(),
});

// Response wrapper schema for planner task responses
const plannerTaskResponseSchema = z.object({
  type: z.literal('plannerTaskResponse'),
  action: z.string(),
  requestId: z.string(),
  response: baseResponseSchema,
  timestamp: z.number(),
});

// Task service response schema (generic base)
export const taskServiceResponseSchema = baseResponseSchema;

// Task response schema
export const taskResponseSchema = baseResponseSchema.extend({
  data: z.object({
    task: extendedTaskSchema,
  }).optional(),
});

// Task list response schema
export const taskListResponseSchema = baseResponseSchema.extend({
  data: z.object({
    tasks: z.array(extendedTaskSchema),
    totalCount: z.number(),
    stats: taskStatsSchema,
  }).optional(),
});

// Step response schema
export const stepResponseSchema = baseResponseSchema.extend({
  data: z.object({
    step: extendedStepSchema,
  }).optional(),
});

// Step list response schema
export const stepListResponseSchema = baseResponseSchema.extend({
  data: z.object({
    steps: z.array(extendedStepSchema),
    totalCount: z.number(),
  }).optional(),
});

// Task messages response schema
export const taskMessagesResponseSchema = baseResponseSchema.extend({
  data: z.object({
    messages: z.array(taskMessageSchema),
    totalCount: z.number(),
  }).optional(),
});

// Active step response schema
export const activeStepResponseSchema = baseResponseSchema.extend({
  data: z.object({
    activeStep: extendedStepSchema.nullable(),
    allActiveSteps: z.array(extendedStepSchema).optional(),
  }).optional(),
});

// Send steering message response schema
export const sendSteeringMessageResponseSchema = baseResponseSchema.extend({
  data: z.object({
    messageId: z.string(),
  }).optional(),
});

// Delete task response schema
export const deleteTaskResponseSchema = baseResponseSchema.extend({
  data: z.object({
    deleted: z.boolean(),
  }).optional(),
});

// Can task start response schema
export const canTaskStartResponseSchema = baseResponseSchema.extend({
  data: z.object({
    canStart: z.boolean(),
    reason: z.string().optional(),
  }).optional(),
});

// Task stats response schema
export const taskStatsResponseSchema = baseResponseSchema.extend({
  data: taskStatsSchema.optional(),
});

// Specific response schemas for different actions
export const createTaskResponseSchema = taskResponseSchema;
export const getTaskListResponseSchema = taskListResponseSchema;
export const addStepToTaskResponseSchema = stepResponseSchema;
export const getTasksStartedByMeResponseSchema = taskListResponseSchema;
export const getTaskDetailResponseSchema = taskResponseSchema;
export const getTaskMessagesResponseSchema = taskMessagesResponseSchema;
export const getAllStepsResponseSchema = stepListResponseSchema;
export const getCurrentRunningStepResponseSchema = activeStepResponseSchema;
export const updateStepStatusResponseSchema = stepResponseSchema;
export const completeStepResponseSchema = stepResponseSchema;
export const updateTaskResponseSchema = taskResponseSchema;
export const completeTaskResponseSchema = taskResponseSchema;
export const getTasksDependentOnResponseSchema = taskListResponseSchema;
export const getTasksReadyToStartResponseSchema = taskListResponseSchema;
export const getTaskDependencyChainResponseSchema = taskListResponseSchema;
export const getTaskStatsResponseSchema = taskStatsResponseSchema;

// Union of all specific response schemas
export const allTaskServiceResponseSchema = z.union([
  createTaskResponseSchema,
  getTaskListResponseSchema,
  addStepToTaskResponseSchema,
  getTasksStartedByMeResponseSchema,
  getTaskDetailResponseSchema,
  getTaskMessagesResponseSchema,
  sendSteeringMessageResponseSchema,
  getAllStepsResponseSchema,
  getCurrentRunningStepResponseSchema,
  updateStepStatusResponseSchema,
  completeStepResponseSchema,
  updateTaskResponseSchema,
  deleteTaskResponseSchema,
  completeTaskResponseSchema,
  canTaskStartResponseSchema,
  getTasksDependentOnResponseSchema,
  getTasksReadyToStartResponseSchema,
  getTaskDependencyChainResponseSchema,
  getTaskStatsResponseSchema,
]);

// Export the planner task response schema
export const PlannerTaskResponseSchema = plannerTaskResponseSchema;

// Type exports
export type TaskMessage = z.infer<typeof taskMessageSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type Position = z.infer<typeof positionSchema>;
export type FlowNodeData = z.infer<typeof flowNodeDataSchema>;
export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowData = z.infer<typeof flowDataSchema>;
export type Step = z.infer<typeof stepSchema>;
export type ExtendedStep = z.infer<typeof extendedStepSchema>;
export type Task = z.infer<typeof taskSchema>;
export type ExtendedTask = z.infer<typeof extendedTaskSchema>;
export type TaskStats = z.infer<typeof taskStatsSchema>;

export type TaskServiceResponse = z.infer<typeof taskServiceResponseSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type TaskListResponse = z.infer<typeof taskListResponseSchema>;
export type StepResponse = z.infer<typeof stepResponseSchema>;
export type StepListResponse = z.infer<typeof stepListResponseSchema>;
export type TaskMessagesResponse = z.infer<typeof taskMessagesResponseSchema>;
export type ActiveStepResponse = z.infer<typeof activeStepResponseSchema>;
export type SendSteeringMessageResponse = z.infer<typeof sendSteeringMessageResponseSchema>;
export type DeleteTaskResponse = z.infer<typeof deleteTaskResponseSchema>;
export type CanTaskStartResponse = z.infer<typeof canTaskStartResponseSchema>;
export type TaskStatsResponse = z.infer<typeof taskStatsResponseSchema>;

export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>;
export type GetTaskListResponse = z.infer<typeof getTaskListResponseSchema>;
export type AddStepToTaskResponse = z.infer<typeof addStepToTaskResponseSchema>;
export type GetTasksStartedByMeResponse = z.infer<typeof getTasksStartedByMeResponseSchema>;
export type GetTaskDetailResponse = z.infer<typeof getTaskDetailResponseSchema>;
export type GetTaskMessagesResponse = z.infer<typeof getTaskMessagesResponseSchema>;
export type GetAllStepsResponse = z.infer<typeof getAllStepsResponseSchema>;
export type GetCurrentRunningStepResponse = z.infer<typeof getCurrentRunningStepResponseSchema>;
export type UpdateStepStatusResponse = z.infer<typeof updateStepStatusResponseSchema>;
export type CompleteStepResponse = z.infer<typeof completeStepResponseSchema>;
export type UpdateTaskResponse = z.infer<typeof updateTaskResponseSchema>;
export type CompleteTaskResponse = z.infer<typeof completeTaskResponseSchema>;
export type GetTasksDependentOnResponse = z.infer<typeof getTasksDependentOnResponseSchema>;
export type GetTasksReadyToStartResponse = z.infer<typeof getTasksReadyToStartResponseSchema>;
export type GetTaskDependencyChainResponse = z.infer<typeof getTaskDependencyChainResponseSchema>;
export type GetTaskStatsResponse = z.infer<typeof getTaskStatsResponseSchema>;

export type PlannerTaskResponse = z.infer<typeof plannerTaskResponseSchema>;
export type AllTaskServiceResponse = z.infer<typeof allTaskServiceResponseSchema>; 