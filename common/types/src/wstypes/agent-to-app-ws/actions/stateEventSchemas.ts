import { z } from 'zod';

/**
 * State Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/state.ts module operations
 */

// Base state message schema
export const stateEventBaseSchema = z.object({
  type: z.string(),
  action: z.string(),
  requestId: z.string(),
});

// Get Application State Event Schema
export const getApplicationStateEventSchema = stateEventBaseSchema.extend({
  type: z.literal('projectStateEvent'),
  action: z.literal('getAppState'),
});

// Add To Agent State Event Schema
export const addToAgentStateEventSchema = stateEventBaseSchema.extend({
  type: z.literal('agentStateEvent'),
  action: z.literal('addToAgentState'),
  payload: z.object({
    key: z.string(),
    value: z.string(),
  }),
});

// Get Agent State Event Schema
export const getAgentStateEventSchema = stateEventBaseSchema.extend({
  type: z.literal('agentStateEvent'),
  action: z.literal('getAgentState'),
});

// Get Project State Event Schema
export const getProjectStateEventSchema = stateEventBaseSchema.extend({
  type: z.literal('projectStateEvent'),
  action: z.literal('getProjectState'),
});

// Update Project State Event Schema
export const updateProjectStateEventSchema = stateEventBaseSchema.extend({
  type: z.literal('projectStateEvent'),
  action: z.literal('updateProjectState'),
  payload: z.object({
    key: z.string(),
    value: z.any(),
  }),
});

// Union of all state event schemas
export const stateEventSchema = z.union([
  getApplicationStateEventSchema,
  addToAgentStateEventSchema,
  getAgentStateEventSchema,
  getProjectStateEventSchema,
  updateProjectStateEventSchema,
]);

// Inferred TypeScript types for events
export type StateEventBase = z.infer<typeof stateEventBaseSchema>;
export type GetApplicationStateEvent = z.infer<typeof getApplicationStateEventSchema>;
export type AddToAgentStateEvent = z.infer<typeof addToAgentStateEventSchema>;
export type GetAgentStateEvent = z.infer<typeof getAgentStateEventSchema>;
export type GetProjectStateEvent = z.infer<typeof getProjectStateEventSchema>;
export type UpdateProjectStateEvent = z.infer<typeof updateProjectStateEventSchema>;
export type StateEvent = z.infer<typeof stateEventSchema>;

