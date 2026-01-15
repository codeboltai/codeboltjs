import { z } from 'zod';

// Define ActionPlanTask schema (based on usage, assuming structure)
export const actionPlanTaskSchema = z.object({
    taskId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: z.string(),
    priority: z.string().optional(),
    threadId: z.string().optional(),
    // Add other fields as needed based on ActionPlanTask interface
    statusUpdatedAt: z.string().optional(),
    updatedAt: z.string().optional()
});

// Define ActionPlan schema
export const actionPlanSchema = z.object({
    planId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    items: z.array(actionPlanTaskSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
    status: z.string()
});

// Response schemas
export const getAllActionPlansResponseSchema = z.object({
    type: z.literal('getAllActionPlansResponse'),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
    actionPlans: z.array(actionPlanSchema).optional()
});

export const getActionPlanDetailResponseSchema = z.object({
    type: z.literal('getActionPlanDetailResponse'),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
    actionPlan: actionPlanSchema.optional()
});

export const createActionPlanResponseSchema = z.object({
    type: z.literal('createActionPlanResponse'),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
    actionPlan: actionPlanSchema.optional()
});

export const updateActionPlanResponseSchema = z.object({
    type: z.literal('updateActionPlanResponse'),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
    actionPlan: actionPlanSchema.optional()
});

export const addTaskToActionPlanResponseSchema = z.object({
    type: z.literal('addTaskToActionPlanResponse'),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
    task: actionPlanTaskSchema.optional(),
    actionPlan: actionPlanSchema.optional()
});

export const actionPlanResponseSchema = z.object({
    type: z.literal('actionPlanResponse'),
    action: z.string(),
    response: z.any(),
    success: z.boolean(),
    message: z.string(),
    error: z.object({
        code: z.string(),
        details: z.string()
    }).optional(),
    timestamp: z.string(),
    requestId: z.string().optional()
});

export const actionPlanServiceResponseSchema = z.union([
    getAllActionPlansResponseSchema,
    getActionPlanDetailResponseSchema,
    createActionPlanResponseSchema,
    updateActionPlanResponseSchema,
    addTaskToActionPlanResponseSchema,
    actionPlanResponseSchema,
    z.object({
        type: z.literal('error'),
        success: z.boolean(),
        message: z.string(),
        error: z.string().optional(),
        timestamp: z.string(),
        requestId: z.string().optional()
    })
]);

export type ActionPlanTask = z.infer<typeof actionPlanTaskSchema>;
export type ActionPlan = z.infer<typeof actionPlanSchema>;
export type GetAllActionPlansResponse = z.infer<typeof getAllActionPlansResponseSchema>;
export type GetActionPlanDetailResponse = z.infer<typeof getActionPlanDetailResponseSchema>;
export type CreateActionPlanResponse = z.infer<typeof createActionPlanResponseSchema>;
export type UpdateActionPlanResponse = z.infer<typeof updateActionPlanResponseSchema>;
export type AddTaskToActionPlanResponse = z.infer<typeof addTaskToActionPlanResponseSchema>;
export type ActionPlanResponse = z.infer<typeof actionPlanResponseSchema>;
export type ActionPlanServiceResponse = z.infer<typeof actionPlanServiceResponseSchema>;
