import { z } from 'zod';

/**
 * Thread Service Response Schemas
 * Messages sent from thread CLI service back to agents
 * Based on thread-service.cli.ts response structure
 */

// Thread Status enum
export const threadStatusSchema = z.enum([
    'created',
    'planned',
    'pending',
    'in_progress',
    'waiting_user',
    'review',
    'completed',
    'cancelled',
    'failed',
    'active'
]);

// Thread Step Status enum
export const threadStepStatusSchema = z.enum([
    'pending',
    'in_progress',
    'completed',
    'failed',
    'skipped',
    'cancelled'
]);

// Thread Priority enum
export const threadPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Thread Type enum
export const threadTypeSchema = z.enum(['scheduled', 'interactive']);

// Execution Type enum
export const executionTypeSchema = z.enum(['scheduled', 'immediate', 'manual', 'conditional']);

// Environment Type enum
export const environmentTypeSchema = z.enum(['local', 'remote']);

// Start Option enum
export const startOptionSchema = z.enum(['immediately', 'manual', 'based_on_group', 'ontaskfinish']);

// Message Type enum
export const messageTypeSchema = z.enum(['info', 'error', 'warning', 'success', 'steering', 'instruction', 'feedback']);

// Thread Step Response schema
export const threadStepResponseSchema = z.object({
    id: z.number(),
    stepId: z.string(),
    type: z.string(),
    userMessage: z.string(),
    value: z.string().optional(),
    metaData: z.any(),
    isMainTask: z.boolean(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
    condition: z.string().optional(),
    agentId: z.string().optional(),
    status: threadStepStatusSchema,
    flowData: z.any().optional(),
    errorMessage: z.string().optional(),
    result: z.any().optional(),
    threadId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    activatedAt: z.date().optional(),
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
});

// Thread Message Response schema
export const threadMessageResponseSchema = z.object({
    id: z.number(),
    messageId: z.string(),
    threadId: z.string(),
    stepId: z.string().optional(),
    message: z.string(),
    messageType: messageTypeSchema,
    priority: z.enum(['low', 'medium', 'high']),
    timestamp: z.date(),
    userId: z.string().optional(),
    agentId: z.string().optional(),
});

// Thread Memory Response schema
export const threadMemoryResponseSchema = z.object({
    id: z.number(),
    threadId: z.string(),
    memoryId: z.string(),
    format: z.enum(['json', 'markdown', 'todo']),
    createdAt: z.date(),
});

// Thread Response schema
export const threadResponseSchema = z.object({
    id: z.number(),
    threadId: z.string(),
    projectId: z.number().optional(),
    projectPath: z.string().optional(),
    projectName: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    status: threadStatusSchema,
    completed: z.boolean(),
    isRemoteTask: z.boolean(),
    environment: z.record(z.any()).optional(),
    isKanbanTask: z.boolean(),
    threadType: threadTypeSchema,
    executionType: executionTypeSchema,
    environmentType: environmentTypeSchema,
    groupId: z.string(),
    startOption: startOptionSchema,
    dependsOnThreadId: z.string().optional(),
    dependsOnThreadName: z.string().optional(),
    assignedTo: z.string().optional(),
    priority: threadPrioritySchema,
    progress: z.object({
        totalSteps: z.number(),
        completedSteps: z.number(),
        percentage: z.number(),
    }).optional(),
    activeStepId: z.string().optional(),
    flowData: z.any().optional(),
    tags: z.array(z.string()).optional(),
    errorMessage: z.string().optional(),
    cancellationReason: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    statusUpdatedAt: z.date().optional(),
    completedAt: z.date().optional(),
    stepActivatedAt: z.date().optional(),
    steps: z.array(threadStepResponseSchema).optional(),
    messages: z.array(threadMessageResponseSchema).optional(),
    attachedMemories: z.array(threadMemoryResponseSchema).optional(),
});

// Create thread response
export const createThreadResponseSchema = z.object({
    type: z.literal('createThreadResponse'),
    success: z.boolean(),
    thread: threadResponseSchema.nullable(),
    error: z.string().optional(),
});

// Update thread response
export const updateThreadResponseSchema = z.object({
    type: z.literal('updateThreadResponse'),
    success: z.boolean(),
    thread: threadResponseSchema.nullable(),
    threadId: z.string(),
    error: z.string().optional(),
});

// Delete thread response
export const deleteThreadResponseSchema = z.object({
    type: z.literal('deleteThreadResponse'),
    success: z.boolean(),
    threadId: z.string(),
    deleted: z.boolean(),
    error: z.string().optional(),
});

// Get thread response
export const getThreadResponseSchema = z.object({
    type: z.literal('getThreadResponse'),
    success: z.boolean(),
    thread: threadResponseSchema.nullable(),
    threadId: z.string(),
    error: z.string().optional(),
});

// List threads response
export const listThreadsResponseSchema = z.object({
    type: z.literal('listThreadsResponse'),
    success: z.boolean(),
    threads: z.array(threadResponseSchema),
    totalCount: z.number(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    status: z.string().optional(),
    taskId: z.string().optional(),
    agentId: z.string().optional(),
    error: z.string().optional(),
});

// Start thread response
export const startThreadResponseSchema = z.object({
    type: z.literal('startThreadResponse'),
    success: z.boolean(),
    thread: threadResponseSchema.nullable(),
    threadId: z.string(),
    activityId: z.string().optional(),
    error: z.string().optional(),
});

// Update thread status response
export const updateThreadStatusResponseSchema = z.object({
    type: z.literal('updateThreadStatusResponse'),
    success: z.boolean(),
    thread: threadResponseSchema.nullable(),
    threadId: z.string(),
    status: z.string(),
    error: z.string().optional(),
});

// Get thread messages response
export const getThreadMessagesResponseSchema = z.object({
    type: z.literal('getThreadMessagesResponse'),
    success: z.boolean(),
    messages: z.array(threadMessageResponseSchema),
    totalCount: z.number(),
    threadId: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    error: z.string().optional(),
});

// Thread agent started response
export const threadAgentStartedResponseSchema = z.object({
    type: z.literal('ThreadAgentStarted'),
    success: z.boolean(),
    threadId: z.string(),
    agentId: z.string(),
    instanceId: z.string().optional(),
    error: z.string().optional(),
});

// Thread agent start failed response
export const threadAgentStartFailedResponseSchema = z.object({
    type: z.literal('ThreadAgentStartFailed'),
    success: z.boolean(),
    threadId: z.string(),
    agentId: z.string().optional(),
    error: z.string(),
});

// Error response
export const threadErrorResponseSchema = z.object({
    type: z.literal('errorResponse'),
    success: z.boolean(),
    error: z.string(),
});

// Union of all thread service responses
export const threadServiceResponseSchema = z.union([
    createThreadResponseSchema,
    updateThreadResponseSchema,
    deleteThreadResponseSchema,
    getThreadResponseSchema,
    listThreadsResponseSchema,
    startThreadResponseSchema,
    updateThreadStatusResponseSchema,
    getThreadMessagesResponseSchema,
    threadErrorResponseSchema,
]);

// TypeScript types
export type ThreadStatus = z.infer<typeof threadStatusSchema>;
export type ThreadStepStatus = z.infer<typeof threadStepStatusSchema>;
export type ThreadPriority = z.infer<typeof threadPrioritySchema>;
export type ThreadType = z.infer<typeof threadTypeSchema>;
export type ExecutionType = z.infer<typeof executionTypeSchema>;
export type EnvironmentType = z.infer<typeof environmentTypeSchema>;
export type StartOption = z.infer<typeof startOptionSchema>;
export type MessageType = z.infer<typeof messageTypeSchema>;

export type ThreadStepResponse = z.infer<typeof threadStepResponseSchema>;
export type ThreadMessageResponse = z.infer<typeof threadMessageResponseSchema>;
export type ThreadMemoryResponse = z.infer<typeof threadMemoryResponseSchema>;
export type ThreadResponse = z.infer<typeof threadResponseSchema>;

export type CreateThreadResponse = z.infer<typeof createThreadResponseSchema>;
export type UpdateThreadResponse = z.infer<typeof updateThreadResponseSchema>;
export type DeleteThreadResponse = z.infer<typeof deleteThreadResponseSchema>;
export type GetThreadResponse = z.infer<typeof getThreadResponseSchema>;
export type ListThreadsResponse = z.infer<typeof listThreadsResponseSchema>;
export type StartThreadResponse = z.infer<typeof startThreadResponseSchema>;
export type UpdateThreadStatusResponse = z.infer<typeof updateThreadStatusResponseSchema>;
export type GetThreadMessagesResponse = z.infer<typeof getThreadMessagesResponseSchema>;
export type ThreadErrorResponse = z.infer<typeof threadErrorResponseSchema>;
export type ThreadAgentStartedResponse = z.infer<typeof threadAgentStartedResponseSchema>;
export type ThreadAgentStartFailedResponse = z.infer<typeof threadAgentStartFailedResponseSchema>;

export type ThreadServiceResponse = z.infer<typeof threadServiceResponseSchema>;
