import { z } from 'zod';

/**
 * Thread Event Schemas for Agent-to-App Communication
 * Based on taskEventSchemas.ts structure
 */

// Base thread message schema
export const threadEventBaseSchema = z.object({
    type: z.literal('threadEvent'),
    action: z.string(),
    requestId: z.string(),
    agentId: z.string().optional(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
});

// MessageData schema (reusing from task)
const messageDataSchema = z.object({
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
    type: z.string(),
    userMessage: z.string(),
    messageData: messageDataSchema.optional(),
    isMainTask: z.boolean().optional(),
    position: positionSchema.optional(),
    condition: z.string().optional(),
    agentId: z.string().optional(),
    FlowData: flowDataSchema.optional(),
    status: z.string().optional(),
});

// Thread create options schema
const createThreadOptionsSchema = z.object({
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
    isGrouped: z.boolean().optional(),
    startOption: z.enum(['immediately', 'manual', 'based_on_group', 'ontaskfinish']).optional(),
    dependsOnTaskId: z.string().optional(),
    dependsOnTaskName: z.string().optional(),
    steps: z.array(stepSchema).optional(),

    // Message processing parameters
    userMessage: z.string().optional(),
    selectedAgent: z.any().optional(),
    mentionedAgents: z.array(z.any()).optional(),
    mentionedMCPs: z.array(z.any()).optional(),
    remixPrompt: z.string().optional(),
    remoteProvider: z.object({
        id: z.string(),
        name: z.string().optional(),
    }).optional(),
    activeStepId: z.string().optional(),
    currentStep: z.any().optional(),
    messageId: z.string().optional(),
    selection: z.object({
        selectedText: z.string().optional(),
    }).optional(),
    processId: z.string().optional(),
    stepId: z.string().optional(),
});

// Thread update options schema
const updateThreadOptionsSchema = z.object({
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
    isGrouped: z.boolean().optional(),
    startOption: z.enum(['immediately', 'manual', 'based_on_group', 'ontaskfinish']).optional(),
    dependsOnTaskId: z.string().optional(),
    dependsOnTaskName: z.string().optional(),

    // Message processing parameters
    userMessage: z.string().optional(),
    selectedAgent: z.any().optional(),
    mentionedAgents: z.array(z.any()).optional(),
    mentionedMCPs: z.array(z.any()).optional(),
    remixPrompt: z.string().optional(),
    remoteProvider: z.object({
        id: z.string(),
        name: z.string().optional(),
    }).optional(),
    activeStepId: z.string().optional(),
    currentStep: z.any().optional(),
    messageId: z.string().optional(),
    selection: z.object({
        selectedText: z.string().optional(),
    }).optional(),
    processId: z.string().optional(),
    stepId: z.string().optional(),
});

// Get thread list options schema
const getThreadListOptionsSchema = z.object({
    threadId: z.string().optional(),
    status: z.enum(['completed', 'pending', 'processing', 'all']).optional(),
    startedByUser: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
});

// Get thread detail options schema
const getThreadDetailOptionsSchema = z.object({
    taskId: z.string(),
    includeSteps: z.boolean().optional(),
    includeMessages: z.boolean().optional(),
});

// Get thread messages options schema
const getThreadMessagesOptionsSchema = z.object({
    taskId: z.string(),
    stepId: z.string().optional(),
    messageType: z.enum(['info', 'error', 'warning', 'success', 'steering', 'instruction', 'feedback']).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
});

// Delete thread options schema
const deleteThreadOptionsSchema = z.object({
    taskId: z.string(),
});

// Start thread options schema
const startThreadOptionsSchema = z.object({
    taskId: z.string(),
});

// Update thread status options schema
const updateThreadStatusOptionsSchema = z.object({
    threadId: z.string(),
    status: z.string(),
});

// Create and start thread options schema (combines creation and starting with optional message processing)
const createAndStartThreadOptionsSchema = z.object({
    // Basic thread parameters
    title: z.string().optional(),
    description: z.string().optional(),
    taskId: z.string().optional(),
    agentId: z.string().optional(),
    status: z.string().optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),

    // Message processing parameters
    userMessage: z.string().optional(),
    selectedAgent: z.any().optional(),
    mentionedAgents: z.array(z.any()).optional(),
    mentionedMCPs: z.array(z.any()).optional(),
    remixPrompt: z.string().optional(),
    isRemoteTask: z.boolean().optional(),
    remoteProvider: z.object({
        id: z.string(),
        name: z.string().optional(),
    }).optional(),
    activeStepId: z.string().optional(),
    currentStep: z.any().optional(),
    steps: z.array(z.any()).optional(),
    messageId: z.string().optional(),
    selection: z.object({
        selectedText: z.string().optional(),
    }).optional(),
    environment: z.any().optional(),
    groupId: z.string().optional(),
    isGrouped: z.boolean().optional(),
    processId: z.string().optional(),
    stepId: z.string().optional(),
});

// Create Thread Event Schema
export const createThreadEventSchema = threadEventBaseSchema.extend({
    action: z.literal('createThread'),
    message: createThreadOptionsSchema,
});

// Get Thread List Event Schema
export const getThreadListEventSchema = threadEventBaseSchema.extend({
    action: z.literal('getThreadList'),
    message: getThreadListOptionsSchema.optional(),
});

// Get Thread Detail Event Schema
export const getThreadDetailEventSchema = threadEventBaseSchema.extend({
    action: z.literal('getThreadDetail'),
    message: getThreadDetailOptionsSchema,
});

// Get Thread Messages Event Schema
export const getThreadMessagesEventSchema = threadEventBaseSchema.extend({
    action: z.literal('getThreadMessages'),
    message: getThreadMessagesOptionsSchema,
});

// Update Thread Event Schema
export const updateThreadEventSchema = threadEventBaseSchema.extend({
    action: z.literal('updateThread'),
    message: z.object({
        threadId: z.string(),
    }).merge(updateThreadOptionsSchema),
});

// Delete Thread Event Schema
export const deleteThreadEventSchema = threadEventBaseSchema.extend({
    action: z.literal('deleteThread'),
    message: deleteThreadOptionsSchema,
});

// Start Thread Event Schema
export const startThreadEventSchema = threadEventBaseSchema.extend({
    action: z.literal('startThread'),
    message: startThreadOptionsSchema,
});

// Update Thread Status Event Schema
export const updateThreadStatusEventSchema = threadEventBaseSchema.extend({
    action: z.literal('updateThreadStatus'),
    message: updateThreadStatusOptionsSchema,
});

// Create And Start Thread Event Schema
export const createAndStartThreadEventSchema = threadEventBaseSchema.extend({
    action: z.literal('createAndStartThread'),
    message: createAndStartThreadOptionsSchema,
});

// Union of all thread event schemas
export const threadEventSchema = z.union([
    createThreadEventSchema,
    getThreadListEventSchema,
    getThreadDetailEventSchema,
    getThreadMessagesEventSchema,
    updateThreadEventSchema,
    deleteThreadEventSchema,
    startThreadEventSchema,
    updateThreadStatusEventSchema,
    createAndStartThreadEventSchema,
]);

// Inferred TypeScript types for events
export type ThreadEventBase = z.infer<typeof threadEventBaseSchema>;
export type MessageData = z.infer<typeof messageDataSchema>;
export type Position = z.infer<typeof positionSchema>;
export type FlowNodeData = z.infer<typeof flowNodeDataSchema>;
export type FlowNode = z.infer<typeof flowNodeSchema>;
export type FlowData = z.infer<typeof flowDataSchema>;
export type Step = z.infer<typeof stepSchema>;
export type CreateThreadOptions = z.infer<typeof createThreadOptionsSchema>;
export type UpdateThreadOptions = z.infer<typeof updateThreadOptionsSchema>;
export type GetThreadListOptions = z.infer<typeof getThreadListOptionsSchema>;
export type GetThreadDetailOptions = z.infer<typeof getThreadDetailOptionsSchema>;
export type GetThreadMessagesOptions = z.infer<typeof getThreadMessagesOptionsSchema>;
export type DeleteThreadOptions = z.infer<typeof deleteThreadOptionsSchema>;
export type StartThreadOptions = z.infer<typeof startThreadOptionsSchema>;
export type UpdateThreadStatusOptions = z.infer<typeof updateThreadStatusOptionsSchema>;
export type CreateAndStartThreadOptions = z.infer<typeof createAndStartThreadOptionsSchema>;

export type CreateThreadEvent = z.infer<typeof createThreadEventSchema>;
export type GetThreadListEvent = z.infer<typeof getThreadListEventSchema>;
export type GetThreadDetailEvent = z.infer<typeof getThreadDetailEventSchema>;
export type GetThreadMessagesEvent = z.infer<typeof getThreadMessagesEventSchema>;
export type UpdateThreadEvent = z.infer<typeof updateThreadEventSchema>;
export type DeleteThreadEvent = z.infer<typeof deleteThreadEventSchema>;
export type StartThreadEvent = z.infer<typeof startThreadEventSchema>;
export type UpdateThreadStatusEvent = z.infer<typeof updateThreadStatusEventSchema>;
export type CreateAndStartThreadEvent = z.infer<typeof createAndStartThreadEventSchema>;
export type ThreadEvent = z.infer<typeof threadEventSchema>;
