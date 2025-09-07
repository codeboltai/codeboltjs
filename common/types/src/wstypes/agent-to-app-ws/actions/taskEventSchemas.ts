import { z } from 'zod';

/**
 * Task Event Schemas for Agent-to-App Communication
 * Based on CodeBolt tasksService.cli.ts operations
 */

// Base task message schema
export const taskEventBaseSchema = z.object({
  type: z.literal('taskEvent'),
  action: z.string(),
  requestId: z.string(),
  agentId: z.string().optional(),
  threadId: z.string().optional(),
  agentInstanceId: z.string().optional(),
  parentAgentInstanceId: z.string().optional(),
  parentId: z.string().optional(),
});

// Metadata schema for task steps
const metadataSchema = z.object({
  mentionedFiles: z.array(z.string()).optional(),
  mentionedFullPaths: z.array(z.string()).optional(),
  mentionedFolders: z.array(z.string()).optional(),
  mentionedMultiFile: z.array(z.string()).optional(),
  mentionedMCPs: z.array(z.string()).optional(),
  uploadedImages: z.array(z.string()).optional(),
  mentionedAgents: z.array(z.string()).optional(),
  mentionedDocs: z.array(z.string()).optional(),
  links: z.array(z.string()).optional(),
  controlFiles: z.array(z.string()).optional(),
  isRemoteTask: z.boolean().optional(),
  environment: z.record(z.any()).nullable().optional(),
  llmProvider: z.object({
    providerId: z.string(),
    model: z.string(),
  }).optional(),
});

// Position schema for task steps
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
  edges: z.array(z.any()), // Generic edges array
});

// Step schema for task creation
const stepSchema = z.object({
  type: z.string(),
  userMessage: z.string(),
  metaData: metadataSchema.optional(),
  isMainTask: z.boolean().optional(),
  position: positionSchema.optional(),
  condition: z.string().optional(),
  agentId: z.string().optional(),
  FlowData: flowDataSchema.optional(),
  status: z.string().optional(),
});

// Task create options schema
const createTaskOptionsSchema = z.object({
  threadId: z.string(),
  name: z.string(),
  dueDate: z.date().nullable().optional(),
  isRemoteTask: z.boolean().optional(),
  environment: z.string().nullable().optional(),
  isKanbanTask: z.boolean().optional(),
  taskType: z.enum(['scheduled', 'interactive']).optional(),
  executionType: z.enum(['scheduled', 'immediate', 'manual', 'conditional']).optional(),
  environmentType: z.enum(['local', 'remote']).optional(),
  groupId: z.string().optional(),
  startOption: z.enum(['immediately', 'manual', 'based_on_group', 'ontaskfinish']).optional(),
  dependsOnTaskId: z.string().optional(),
  dependsOnTaskName: z.string().optional(),
  steps: z.array(stepSchema).optional(),
});

// Task update options schema
const updateTaskOptionsSchema = z.object({
  name: z.string().optional(),
  dueDate: z.date().nullable().optional(),
  completed: z.boolean().optional(),
  steps: z.array(stepSchema.extend({ id: z.string() })).optional(),
  isRemoteTask: z.boolean().optional(),
  environment: z.string().nullable().optional(),
  isKanbanTask: z.boolean().optional(),
  taskType: z.enum(['scheduled', 'interactive']).optional(),
  executionType: z.enum(['scheduled', 'immediate', 'manual', 'conditional']).optional(),
  environmentType: z.enum(['local', 'remote']).optional(),
  groupId: z.string().optional(),
  startOption: z.enum(['immediately', 'manual', 'based_on_group', 'ontaskfinish']).optional(),
  dependsOnTaskId: z.string().optional(),
  dependsOnTaskName: z.string().optional(),
});

// Get task list options schema
const getTaskListOptionsSchema = z.object({
  threadId: z.string().optional(),
  status: z.enum(['completed', 'pending', 'processing', 'all']).optional(),
  startedByUser: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// Add step to task options schema
const addStepToTaskOptionsSchema = z.object({
  taskId: z.string(),
  type: z.string(),
  userMessage: z.string(),
  metaData: metadataSchema.optional(),
  isMainTask: z.boolean().optional(),
  position: positionSchema.optional(),
  condition: z.string().optional(),
  agentId: z.string().optional(),
  FlowData: flowDataSchema.optional(),
  status: z.string().optional(),
});

// Get task detail options schema
const getTaskDetailOptionsSchema = z.object({
  taskId: z.string(),
  includeSteps: z.boolean().optional(),
  includeMessages: z.boolean().optional(),
});

// Get task messages options schema
const getTaskMessagesOptionsSchema = z.object({
  taskId: z.string(),
  stepId: z.string().optional(),
  messageType: z.enum(['info', 'error', 'warning', 'success', 'steering', 'instruction', 'feedback']).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// Send steering message options schema
const sendSteeringMessageOptionsSchema = z.object({
  taskId: z.string(),
  stepId: z.string(),
  message: z.string(),
  messageType: z.enum(['steering', 'instruction', 'feedback']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// Get all steps options schema
const getAllStepsOptionsSchema = z.object({
  taskId: z.string().optional(),
  status: z.enum(['completed', 'pending', 'processing', 'all']).optional(),
  agentId: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// Get active step options schema
const getActiveStepOptionsSchema = z.object({
  taskId: z.string().optional(),
  agentId: z.string().optional(),
});

// Update step status options schema
const updateStepStatusOptionsSchema = z.object({
  taskId: z.string(),
  stepId: z.string(),
  status: z.string(),
});

// Complete step options schema
const completeStepOptionsSchema = z.object({
  taskId: z.string(),
  stepId: z.string(),
});

// Delete task options schema
const deleteTaskOptionsSchema = z.object({
  taskId: z.string(),
});

// Complete task options schema
const completeTaskOptionsSchema = z.object({
  taskId: z.string(),
});

// Can task start options schema
const canTaskStartOptionsSchema = z.object({
  taskId: z.string(),
});

// Get tasks dependent on options schema
const getTasksDependentOnOptionsSchema = z.object({
  taskId: z.string(),
});

// Get tasks ready to start options schema
const getTasksReadyToStartOptionsSchema = z.object({
  threadId: z.string().optional(),
});

// Get task dependency chain options schema
const getTaskDependencyChainOptionsSchema = z.object({
  taskId: z.string(),
});

// Get task stats options schema
const getTaskStatsOptionsSchema = z.object({
  threadId: z.string().optional(),
});

// Create Task Event Schema
export const createTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('createTask'),
  message: createTaskOptionsSchema,
});

// Get Task List Event Schema
export const getTaskListEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTaskList'),
  message: getTaskListOptionsSchema.optional(),
});

// Add Step to Task Event Schema
export const addStepToTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('addStepToTask'),
  message: addStepToTaskOptionsSchema,
});

// Get Tasks Started by Me Event Schema
export const getTasksStartedByMeEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTasksStartedByMe'),
  message: getTaskListOptionsSchema.extend({
    userId: z.string(),
  }),
});

// Get Task Detail Event Schema
export const getTaskDetailEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTaskDetail'),
  message: getTaskDetailOptionsSchema,
});

// Get Task Messages Event Schema
export const getTaskMessagesEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTaskMessages'),
  message: getTaskMessagesOptionsSchema,
});

// Send Steering Message Event Schema
export const sendSteeringMessageEventSchema = taskEventBaseSchema.extend({
  action: z.literal('sendSteeringMessage'),
  message: sendSteeringMessageOptionsSchema,
});

// Get All Steps Event Schema
export const getAllStepsEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getAllSteps'),
  message: getAllStepsOptionsSchema.optional(),
});

// Get Current Running Step Event Schema
export const getCurrentRunningStepEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getCurrentRunningStep'),
  message: getActiveStepOptionsSchema.optional(),
});

// Update Step Status Event Schema
export const updateStepStatusEventSchema = taskEventBaseSchema.extend({
  action: z.literal('updateStepStatus'),
  message: updateStepStatusOptionsSchema,
});

// Complete Step Event Schema
export const completeStepEventSchema = taskEventBaseSchema.extend({
  action: z.literal('completeStep'),
  message: completeStepOptionsSchema,
});

// Update Task Event Schema
export const updateTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('updateTask'),
  message: z.object({
    taskId: z.string(),
  }).merge(updateTaskOptionsSchema),
});

// Delete Task Event Schema
export const deleteTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('deleteTask'),
  message: deleteTaskOptionsSchema,
});

// Complete Task Event Schema
export const completeTaskEventSchema = taskEventBaseSchema.extend({
  action: z.literal('completeTask'),
  message: completeTaskOptionsSchema,
});

// Can Task Start Event Schema
export const canTaskStartEventSchema = taskEventBaseSchema.extend({
  action: z.literal('canTaskStart'),
  message: canTaskStartOptionsSchema,
});

// Get Tasks Dependent On Event Schema
export const getTasksDependentOnEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTasksDependentOn'),
  message: getTasksDependentOnOptionsSchema,
});

// Get Tasks Ready to Start Event Schema
export const getTasksReadyToStartEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTasksReadyToStart'),
  message: getTasksReadyToStartOptionsSchema.optional(),
});

// Get Task Dependency Chain Event Schema
export const getTaskDependencyChainEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTaskDependencyChain'),
  message: getTaskDependencyChainOptionsSchema,
});

// Get Task Stats Event Schema
export const getTaskStatsEventSchema = taskEventBaseSchema.extend({
  action: z.literal('getTaskStats'),
  message: getTaskStatsOptionsSchema.optional(),
});

// Union of all task event schemas
export const taskEventSchema = z.union([
  createTaskEventSchema,
  getTaskListEventSchema,
  addStepToTaskEventSchema,
  getTasksStartedByMeEventSchema,
  getTaskDetailEventSchema,
  getTaskMessagesEventSchema,
  sendSteeringMessageEventSchema,
  getAllStepsEventSchema,
  getCurrentRunningStepEventSchema,
  updateStepStatusEventSchema,
  completeStepEventSchema,
  updateTaskEventSchema,
  deleteTaskEventSchema,
  completeTaskEventSchema,
  canTaskStartEventSchema,
  getTasksDependentOnEventSchema,
  getTasksReadyToStartEventSchema,
  getTaskDependencyChainEventSchema,
  getTaskStatsEventSchema,
]);

// Inferred TypeScript types for events
export type TaskEventBase = z.infer<typeof taskEventBaseSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type Position = z.infer<typeof positionSchema>;
export type FlowNodeData = z.infer<typeof flowNodeDataSchema>;
export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowData = z.infer<typeof flowDataSchema>;
export type Step = z.infer<typeof stepSchema>;
export type CreateTaskOptions = z.infer<typeof createTaskOptionsSchema>;
export type UpdateTaskOptions = z.infer<typeof updateTaskOptionsSchema>;
export type GetTaskListOptions = z.infer<typeof getTaskListOptionsSchema>;
export type AddStepToTaskOptions = z.infer<typeof addStepToTaskOptionsSchema>;
export type GetTaskDetailOptions = z.infer<typeof getTaskDetailOptionsSchema>;
export type GetTaskMessagesOptions = z.infer<typeof getTaskMessagesOptionsSchema>;
export type SendSteeringMessageOptions = z.infer<typeof sendSteeringMessageOptionsSchema>;
export type GetAllStepsOptions = z.infer<typeof getAllStepsOptionsSchema>;
export type GetActiveStepOptions = z.infer<typeof getActiveStepOptionsSchema>;
export type UpdateStepStatusOptions = z.infer<typeof updateStepStatusOptionsSchema>;
export type CompleteStepOptions = z.infer<typeof completeStepOptionsSchema>;
export type DeleteTaskOptions = z.infer<typeof deleteTaskOptionsSchema>;
export type CompleteTaskOptions = z.infer<typeof completeTaskOptionsSchema>;
export type CanTaskStartOptions = z.infer<typeof canTaskStartOptionsSchema>;
export type GetTasksDependentOnOptions = z.infer<typeof getTasksDependentOnOptionsSchema>;
export type GetTasksReadyToStartOptions = z.infer<typeof getTasksReadyToStartOptionsSchema>;
export type GetTaskDependencyChainOptions = z.infer<typeof getTaskDependencyChainOptionsSchema>;
export type GetTaskStatsOptions = z.infer<typeof getTaskStatsOptionsSchema>;

export type CreateTaskEvent = z.infer<typeof createTaskEventSchema>;
export type GetTaskListEvent = z.infer<typeof getTaskListEventSchema>;
export type AddStepToTaskEvent = z.infer<typeof addStepToTaskEventSchema>;
export type GetTasksStartedByMeEvent = z.infer<typeof getTasksStartedByMeEventSchema>;
export type GetTaskDetailEvent = z.infer<typeof getTaskDetailEventSchema>;
export type GetTaskMessagesEvent = z.infer<typeof getTaskMessagesEventSchema>;
export type SendSteeringMessageEvent = z.infer<typeof sendSteeringMessageEventSchema>;
export type GetAllStepsEvent = z.infer<typeof getAllStepsEventSchema>;
export type GetCurrentRunningStepEvent = z.infer<typeof getCurrentRunningStepEventSchema>;
export type UpdateStepStatusEvent = z.infer<typeof updateStepStatusEventSchema>;
export type CompleteStepEvent = z.infer<typeof completeStepEventSchema>;
export type UpdateTaskEvent = z.infer<typeof updateTaskEventSchema>;
export type DeleteTaskEvent = z.infer<typeof deleteTaskEventSchema>;
export type CompleteTaskEvent = z.infer<typeof completeTaskEventSchema>;
export type CanTaskStartEvent = z.infer<typeof canTaskStartEventSchema>;
export type GetTasksDependentOnEvent = z.infer<typeof getTasksDependentOnEventSchema>;
export type GetTasksReadyToStartEvent = z.infer<typeof getTasksReadyToStartEventSchema>;
export type GetTaskDependencyChainEvent = z.infer<typeof getTaskDependencyChainEventSchema>;
export type GetTaskStatsEvent = z.infer<typeof getTaskStatsEventSchema>;
export type TaskEvent = z.infer<typeof taskEventSchema>;

