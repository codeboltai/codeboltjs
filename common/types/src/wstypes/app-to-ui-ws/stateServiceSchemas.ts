import { z } from 'zod';

/**
 * State Service Message Schemas
 * Based on stateService.cli.ts
 */

// State response schemas
export const getAgentStateResponseSchema = z.object({
  type: z.literal('getAgentStateResponse'),
  payload: z.any(),
});

export const addToAgentStateResponseSchema = z.object({
  type: z.literal('addToAgentStateResponse'),
  payload: z.object({
    sucess: z.boolean(),
  }),
});


export const stateErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all state service schemas
export const stateServiceMessageSchema = z.union([
  stateErrorResponseSchema,
  getAgentStateResponseSchema,
  addToAgentStateResponseSchema,
]);

// TypeScript types
export type GetAgentStateResponse = z.infer<typeof getAgentStateResponseSchema>;
