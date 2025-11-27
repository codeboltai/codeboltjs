import { z } from 'zod';

/**
 * Action Plan Event Schemas for Agent-to-App Communication
 * Based on CodeBolt actionPlan.cli.ts operations
 */

// Base action plan message schema
export const actionPlanEventBaseSchema = z.object({
    type: z.literal('actionPlanEvent'),
    action: z.string(),
    requestId: z.string(),
    agentId: z.string().optional(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
});

// Get all action plans options schema
export const getAllActionPlansOptionsSchema = z.object({});

// Get action plan detail options schema
export const getActionPlanDetailOptionsSchema = z.object({
    planId: z.string(),
});

// Create action plan options schema
export const createActionPlanOptionsSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    items: z.array(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
});

// Update action plan options schema
export const updateActionPlanOptionsSchema = z.object({
    planId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
    status: z.string().optional(),
});

// Add task to action plan options schema
export const addTaskToActionPlanOptionsSchema = z.object({
    planId: z.string(),
    task: z.object({
        name: z.string(),
        description: z.string().optional(),
        status: z.string().optional(),
        // Add other task fields as needed
    }),
});

// Start task step options schema
export const startTaskStepOptionsSchema = z.object({
    planId: z.string(),
    taskId: z.string(),
});

// Get All Action Plans Event Schema
export const getAllActionPlansEventSchema = actionPlanEventBaseSchema.extend({
    action: z.literal('getAllActionPlans'),
    message: getAllActionPlansOptionsSchema.optional(),
});

// Get Action Plan Detail Event Schema
export const getActionPlanDetailEventSchema = actionPlanEventBaseSchema.extend({
    action: z.union([z.literal('getActionPlanDetail'), z.literal('getPlanDetail')]),
    message: getActionPlanDetailOptionsSchema,
});

// Create Action Plan Event Schema
export const createActionPlanEventSchema = actionPlanEventBaseSchema.extend({
    action: z.literal('createActionPlan'),
    message: createActionPlanOptionsSchema,
});

// Update Action Plan Event Schema
export const updateActionPlanEventSchema = actionPlanEventBaseSchema.extend({
    action: z.literal('updateActionPlan'),
    message: updateActionPlanOptionsSchema,
});

// Add Task To Action Plan Event Schema
export const addTaskToActionPlanEventSchema = actionPlanEventBaseSchema.extend({
    action: z.literal('addTaskToActionPlan'),
    message: addTaskToActionPlanOptionsSchema,
});

// Start Task Step Event Schema
export const startTaskStepEventSchema = actionPlanEventBaseSchema.extend({
    action: z.literal('startTaskStep'),
    message: startTaskStepOptionsSchema,
});

// Union of all action plan event schemas
export const actionPlanEventSchema = z.union([
    getAllActionPlansEventSchema,
    getActionPlanDetailEventSchema,
    createActionPlanEventSchema,
    updateActionPlanEventSchema,
    addTaskToActionPlanEventSchema,
    startTaskStepEventSchema,
]);

// Inferred TypeScript types for events
export type ActionPlanEventBase = z.infer<typeof actionPlanEventBaseSchema>;
export type GetAllActionPlansOptions = z.infer<typeof getAllActionPlansOptionsSchema>;
export type GetActionPlanDetailOptions = z.infer<typeof getActionPlanDetailOptionsSchema>;
export type CreateActionPlanOptions = z.infer<typeof createActionPlanOptionsSchema>;
export type UpdateActionPlanOptions = z.infer<typeof updateActionPlanOptionsSchema>;
export type AddTaskToActionPlanOptions = z.infer<typeof addTaskToActionPlanOptionsSchema>;
export type StartTaskStepOptions = z.infer<typeof startTaskStepOptionsSchema>;

export type GetAllActionPlansEvent = z.infer<typeof getAllActionPlansEventSchema>;
export type GetActionPlanDetailEvent = z.infer<typeof getActionPlanDetailEventSchema>;
export type CreateActionPlanEvent = z.infer<typeof createActionPlanEventSchema>;
export type UpdateActionPlanEvent = z.infer<typeof updateActionPlanEventSchema>;
export type AddTaskToActionPlanEvent = z.infer<typeof addTaskToActionPlanEventSchema>;
export type StartTaskStepEvent = z.infer<typeof startTaskStepEventSchema>;
export type ActionPlanEvent = z.infer<typeof actionPlanEventSchema>;
