import { z } from 'zod';

/**
 * Thread Service Response Schemas
 * Messages sent from thread service back to agents
 * Based on taskServiceResponses.ts structure
 */

// Base response schema
const baseResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    message: z.string().optional(),
    error: z.string().optional(),
});

// Thread message schema
const threadMessageSchema = z.object({
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

// MessageData schema
const messageDataSchema = z.object({
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
    messageData: messageDataSchema,
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
    messageData: messageDataSchema,
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
    messages: z.array(threadMessageSchema).optional(),
    isActive: z.boolean().optional(),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
});

// Thread schema (same as task schema)
const threadSchema = z.object({
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

// Extended thread schema
const extendedThreadSchema = threadSchema.extend({
    startedBy: z.string().optional(),
    currentStep: stepSchema.optional(),
    activeSteps: z.array(stepSchema).optional(),
    messages: z.array(threadMessageSchema).optional(),
    progress: z.object({
        totalSteps: z.number(),
        completedSteps: z.number(),
        percentage: z.number(),
    }).optional(),
});

// Thread stats schema
const threadStatsSchema = z.object({
    total: z.number(),
    completed: z.number(),
    pending: z.number(),
    processing: z.number(),
    overdue: z.number(),
});

// Thread service response schema (generic base)
export const threadServiceResponseSchema = baseResponseSchema;

// Thread response schema
export const threadResponseSchema = baseResponseSchema.extend({
    data: z.object({
        task: extendedThreadSchema,
    }).optional(),
});

// Thread list response schema
export const threadListResponseSchema = baseResponseSchema.extend({
    data: z.object({
        tasks: z.array(extendedThreadSchema),
        totalCount: z.number(),
        stats: threadStatsSchema,
    }).optional(),
});

// Thread messages response schema
export const threadMessagesResponseSchema = baseResponseSchema.extend({
    data: z.object({
        messages: z.array(threadMessageSchema),
        totalCount: z.number(),
    }).optional(),
});

// Specific response schemas for different actions
export const createThreadResponseSchema = threadResponseSchema;
export const getThreadListResponseSchema = threadListResponseSchema;
export const getThreadDetailResponseSchema = threadResponseSchema;
export const getThreadMessagesResponseSchema = threadMessagesResponseSchema;
export const updateThreadResponseSchema = threadResponseSchema;
export const deleteThreadResponseSchema = baseResponseSchema.extend({
    data: z.object({
        deleted: z.boolean(),
    }).optional(),
});
export const startThreadResponseSchema = threadResponseSchema;
export const updateThreadStatusResponseSchema = threadResponseSchema;

// Union of all specific response schemas
export const allThreadServiceResponseSchema = z.union([
    createThreadResponseSchema,
    getThreadListResponseSchema,
    getThreadDetailResponseSchema,
    getThreadMessagesResponseSchema,
    updateThreadResponseSchema,
    deleteThreadResponseSchema,
    startThreadResponseSchema,
    updateThreadStatusResponseSchema,
]);

// Type exports
export type ThreadMessage = z.infer<typeof threadMessageSchema>;
export type ThreadResponseMessageData = z.infer<typeof messageDataSchema>;
export type Position = z.infer<typeof positionSchema>;
export type FlowNodeData = z.infer<typeof flowNodeDataSchema>;
export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowData = z.infer<typeof flowDataSchema>;
export type Step = z.infer<typeof stepSchema>;
export type ExtendedStep = z.infer<typeof extendedStepSchema>;
export type Thread = z.infer<typeof threadSchema>;
export type ExtendedThread = z.infer<typeof extendedThreadSchema>;
export type ThreadStats = z.infer<typeof threadStatsSchema>;

export type ThreadServiceResponse = z.infer<typeof threadServiceResponseSchema>;
export type ThreadResponse = z.infer<typeof threadResponseSchema>;
export type ThreadListResponse = z.infer<typeof threadListResponseSchema>;
export type ThreadMessagesResponse = z.infer<typeof threadMessagesResponseSchema>;
export type DeleteThreadResponse = z.infer<typeof deleteThreadResponseSchema>;

export type CreateThreadResponse = z.infer<typeof createThreadResponseSchema>;
export type GetThreadListResponse = z.infer<typeof getThreadListResponseSchema>;
export type GetThreadDetailResponse = z.infer<typeof getThreadDetailResponseSchema>;
export type GetThreadMessagesResponse = z.infer<typeof getThreadMessagesResponseSchema>;
export type UpdateThreadResponse = z.infer<typeof updateThreadResponseSchema>;
export type StartThreadResponse = z.infer<typeof startThreadResponseSchema>;
export type UpdateThreadStatusResponse = z.infer<typeof updateThreadStatusResponseSchema>;

export type AllThreadServiceResponse = z.infer<typeof allThreadServiceResponseSchema>;
